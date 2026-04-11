import { useEffect, useState } from "react";
import { Search, MapPin, Clock, Activity, Plus } from "lucide-react";
import { useAuth } from "./AuthContext";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";
import { useNavigate } from "react-router";

type Match = {
  id: string;
  name: string;
  sport: string;
  level: string;
  location: string;
  time: string;
  authorId: string;
  createdAt: string;
  peopleNeeded?: number;
  gender?: string;
  status?: 'open' | 'closed';
};

export function Matchmaking() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Mọi cấp độ');
  const [selectedGender, setSelectedGender] = useState('Tất cả');
  const [selectedSport, setSelectedSport] = useState('Tất cả');
  const [showOpenOnly, setShowOpenOnly] = useState(true);
  
  const [formData, setFormData] = useState({
    sport: "Cầu lông",
    level: "Mới bắt đầu",
    location: "Cơ sở B",
    time: "17:00",
    peopleNeeded: 1,
    gender: "Tất cả",
  });

  const fetchMatches = async () => {
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-eeef72dc/matches`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await res.json();
      setMatches((data || []).filter(Boolean).sort((a: any, b: any) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()));
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Bạn cần đăng nhập để tạo bài!");
      navigate('/auth');
      return;
    }

    try {
      const newMatch = {
        ...formData,
        name: user?.user_metadata?.name || user?.email?.split('@')[0],
        authorId: user?.id,
        status: 'open',
      };

      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-eeef72dc/matches`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(newMatch)
      });

      if (res.ok) {
        toast.success("Tạo bài thành công!");
        setShowModal(false);
        fetchMatches();
      } else {
        toast.error("Không thể tạo bài");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ");
    }
  };

  const mockUsers = [
    { id: 'm1', name: "Nguyễn Văn A", sport: "Cầu lông", level: "Trung bình", location: "Cơ sở B", time: "Chiều 17:00", peopleNeeded: 2, gender: "Nam", status: 'open' as const },
    { id: 'm2', name: "Trần Thị B", sport: "Chạy bộ", level: "Mới bắt đầu", location: "Ký túc xá", time: "Sáng 06:00", peopleNeeded: 1, gender: "Nữ", status: 'open' as const },
  ];

  const filteredMatches = displayMatches.filter((m: any) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'Mọi cấp độ' || m.level === selectedLevel;
    const matchesGender = selectedGender === 'Tất cả' || m.gender === selectedGender;
    const matchesSport = selectedSport === 'Tất cả' || m.sport === selectedSport;
    const matchesStatus = !showOpenOnly || m.status === 'open';
    return matchesSearch && matchesLevel && matchesGender && matchesSport && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ghép cặp tìm bạn tập</h1>
          <p className="text-gray-600">Tìm kiếm partner phù hợp với lịch trình của bạn</p>
        </div>
        <button 
          onClick={() => session ? setShowModal(true) : navigate('/auth')}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 w-full sm:w-auto flex justify-center items-center gap-2"
        >
          <Plus size={18} /> Tạo bài tìm bạn
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm theo tên, môn thể thao, địa điểm..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            className="border border-gray-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:border-teal-500"
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
          >
            <option>Tất cả môn</option>
            <option>Cầu lông</option>
            <option>Bóng đá</option>
            <option>Bóng rổ</option>
            <option>Chạy bộ</option>
            <option>Tennis</option>
          </select>
          
          <select 
            className="border border-gray-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:border-teal-500"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option>Mọi cấp độ</option>
            <option>Mới bắt đầu</option>
            <option>Trung bình</option>
            <option>Nâng cao</option>
          </select>
          
          <select 
            className="border border-gray-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:border-teal-500"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            <option>Tất cả giới tính</option>
            <option>Nam</option>
            <option>Nữ</option>
          </select>
          
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={showOpenOnly}
              onChange={(e) => setShowOpenOnly(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium">Chỉ hiện "Đang mở"</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((m: any) => (
            <div key={m.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-teal-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{m.name}</h3>
                    <div className="flex gap-2">
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">{m.sport}</span>
                      {m.status === 'open' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Đang mở</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-teal-600">{m.peopleNeeded || 1} người cần</div>
                  <div className="text-xs text-gray-500">cần tìm</div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="flex items-center gap-2"><MapPin size={16} className="text-teal-500"/> {m.location}</p>
                <p className="flex items-center gap-2"><Clock size={16} className="text-teal-500"/> {m.time}</p>
                <p className="flex items-center gap-2"><Activity size={16} className="text-teal-500"/> Trình độ: {m.level}</p>
                {m.gender && <p className="flex items-center gap-2"><Users size={16} className="text-teal-500"/> Giới tính: {m.gender}</p>}
              </div>
              <button 
                onClick={() => {
                  if(!session) navigate('/auth');
                  else toast.success(`Đã gửi yêu cầu kết nối đến ${m.name}!`);
                }}
                className="w-full py-2 border border-teal-600 text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors"
              >
                Nhắn tin kết nối
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-teal-800 mb-4">Tạo bài tìm bạn tập</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Môn thể thao</label>
                <input 
                  type="text" 
                  value={formData.sport}
                  onChange={e => setFormData({...formData, sport: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ</label>
                <select 
                  value={formData.level}
                  onChange={e => setFormData({...formData, level: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500"
                >
                  <option>Mới bắt đầu</option>
                  <option>Trung bình</option>
                  <option>Nâng cao</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (VD: Sáng 06:00, Chiều 17:30)</label>
                <input 
                  type="text" 
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số người cần tìm</label>
                <input 
                  type="number" 
                  min="1"
                  max="10"
                  value={formData.peopleNeeded}
                  onChange={e => setFormData({...formData, peopleNeeded: parseInt(e.target.value) || 1})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính ưu tiên</label>
                <select 
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500"
                >
                  <option>Tất cả</option>
                  <option>Nam</option>
                  <option>Nữ</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium">Hủy</button>
                <button type="submit" className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium">Đăng bài</button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (VD: Sáng 06:00, Chiều 17:30)</label>
                <input 
                  type="text" 
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" 
                  required
                />
              </div>
