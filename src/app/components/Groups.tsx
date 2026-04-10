import { useEffect, useState } from "react";
import { Users, Calendar, Plus } from "lucide-react";
import { useAuth } from "./AuthContext";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "sonner";
import { useNavigate } from "react-router";

type Group = {
  id: string;
  name: string;
  members: number;
  activity: string;
  desc: string;
  authorId: string;
  createdAt: string;
};

export function Groups() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "CLB Bóng Rổ Tự Do",
    activity: "Tối Thứ 6, Chủ nhật",
    desc: "Giao lưu bóng rổ cho các bạn đam mê khu vực quanh cơ sở B.",
  });

  const fetchGroups = async () => {
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-eeef72dc/groups`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await res.json();
      setGroups((data || []).filter(Boolean).sort((a: any, b: any) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()));
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu hội nhóm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Bạn cần đăng nhập để tạo hội nhóm!");
      navigate('/auth');
      return;
    }

    try {
      const newGroup = {
        ...formData,
        members: 1, // Bắt đầu với 1 thành viên (người tạo)
        authorId: user?.id,
      };

      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-eeef72dc/groups`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(newGroup)
      });

      if (res.ok) {
        toast.success("Tạo hội nhóm thành công!");
        setShowModal(false);
        fetchGroups();
      } else {
        toast.error("Không thể tạo hội nhóm");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ");
    }
  };

  const mockGroups = [
    { id: 'g1', name: "CLB Cầu lông UEH", members: 150, activity: "Thứ 3, Thứ 5 hàng tuần", desc: "Nơi giao lưu học hỏi kỹ năng cầu lông cho sinh viên UEH mọi cấp độ. Thường xuyên tổ chức các giải đấu nội bộ." },
    { id: 'g2', name: "UEH Runners", members: 320, activity: "Sáng thứ 7, Chủ nhật", desc: "Nhóm chạy bộ rèn luyện sức khỏe, thường tổ chức chạy quanh khu vực Quận 1, Quận 10 và các giải chạy marathon." },
    { id: 'g3', name: "Yoga Phục Hồi", members: 85, activity: "Các buổi tối 2-4-6", desc: "Thư giãn sau những giờ học căng thẳng với các bài tập yoga nhẹ nhàng. Phù hợp cho người mới bắt đầu." },
    { id: 'g4', name: "Street Workout KTX", members: 120, activity: "Chiều mỗi ngày", desc: "Nhóm tập thể dục dụng cụ ngoài trời ngay tại sân Ký túc xá UEH. Không cần dụng cụ phức tạp, chỉ cần đam mê." },
  ];

  const displayGroups = groups.length > 0 ? groups : mockGroups;

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hội nhóm thể thao</h1>
          <p className="text-gray-600">Tham gia cộng đồng để có thêm động lực tập luyện</p>
        </div>
        <button 
          onClick={() => session ? setShowModal(true) : navigate('/auth')}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 w-full sm:w-auto flex justify-center items-center gap-2"
        >
          <Plus size={18} /> Tạo nhóm mới
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {displayGroups.map((group: any) => (
            <div key={group.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{group.name}</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{group.desc}</p>
                
                <div className="space-y-2 mb-6 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Users size={16} className="text-teal-600"/> <span className="font-medium">{group.members}</span> thành viên
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar size={16} className="text-teal-600"/> Lịch HĐ: {group.activity}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  if(!session) navigate('/auth');
                  else toast.success(`Đã gửi yêu cầu tham gia nhóm ${group.name}! Đang chờ duyệt.`);
                }}
                className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Xin tham gia
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-teal-800 mb-4">Tạo hội nhóm mới</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên hội nhóm</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500"
                  placeholder="Nhập tên hội nhóm"
                  aria-label="Tên hội nhóm"
                  title="Nhập tên hội nhóm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lịch hoạt động</label>
                <input 
                  type="text" 
                  value={formData.activity}
                  onChange={e => setFormData({...formData, activity: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" 
                  placeholder="VD: Thứ 3, Thứ 5 hàng tuần"
                  aria-label="Lịch hoạt động của nhóm"
                  title="Nhập lịch hoạt động thường xuyên của nhóm (VD: Thứ 3, Thứ 5)"
                  required
                />


              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                <textarea 
                  value={formData.desc}
                  onChange={e => setFormData({...formData, desc: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 h-24 resize-none" 
                  placeholder="Nhóm dành cho ai, hoạt động chính là gì..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium">Hủy</button>
                <button type="submit" className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium">Tạo nhóm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
