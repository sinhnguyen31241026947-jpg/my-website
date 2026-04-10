import { useEffect, useState } from "react";
import { Star, MapPin, Plus } from "lucide-react";
import { useAuth } from "./AuthContext";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";
import { useNavigate } from "react-router";

type Venue = {
  id: string;
  name: string;
  type: string;
  rating: number;
  reviews: number;
  distance: string;
  address: string;
  authorId: string;
  createdAt: string;
};

export function Venues() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMapVenue, setSelectedMapVenue] = useState<Venue | null>(null);
  
  const [formData, setFormData] = useState({
    name: "Phòng Gym Cơ Sở B",
    type: "Gym",
    distance: "1 km",
    address: "279 Nguyễn Tri Phương, Quận 10",
  });

  const fetchVenues = async () => {
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-eeef72dc/venues`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await res.json();
      setVenues((data || []).filter(Boolean).sort((a: any, b: any) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()));
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu địa điểm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Bạn cần đăng nhập để thêm địa điểm!");
      navigate('/auth');
      return;
    }

    try {
      const newVenue = {
        ...formData,
        rating: 5.0, // Mặc định điểm đánh giá 5 sao cho người mới tạo
        reviews: 1,
        authorId: user?.id,
      };

      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-eeef72dc/venues`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(newVenue)
      });

      if (res.ok) {
        toast.success("Thêm địa điểm thành công!");
        setShowModal(false);
        fetchVenues();
      } else {
        toast.error("Không thể thêm địa điểm");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ");
    }
  };

  const mockVenues = [
    { id: 'v1', name: "Phòng Gym KTX UEH", type: "Gym", rating: 4.5, reviews: 120, distance: "0.1 km", address: "Ký túc xá UEH, Trần Hưng Đạo" },
    { id: 'v2', name: "Sân cầu lông Nguyễn Tri Phương", type: "Cầu lông", rating: 4.2, reviews: 85, distance: "1.2 km", address: "Gần cơ sở B, Quận 10" },
    { id: 'v3', name: "Sân bóng đá Chảo Lửa", type: "Bóng đá", rating: 4.8, reviews: 200, distance: "3.5 km", address: "Khu vực Tân Bình" },
    { id: 'v4', name: "Hồ bơi Kỳ Đồng", type: "Bơi lội", rating: 4.1, reviews: 90, distance: "2.5 km", address: "Quận 3" },
  ];

  const displayVenues = venues.length > 0 ? venues : mockVenues;

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Địa điểm tập luyện</h1>
          <p className="text-gray-600">Khám phá và đánh giá các phòng tập, sân bãi quanh bạn</p>
        </div>
        <button 
          onClick={() => session ? setShowModal(true) : navigate('/auth')}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 w-full sm:w-auto flex justify-center items-center gap-2"
        >
          <Plus size={18} /> Đăng địa điểm
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["Tất cả", "Gym", "Cầu lông", "Bóng đá", "Bơi lội", "Yoga"].map(cat => (
          <button key={cat} className="whitespace-nowrap px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-teal-500 hover:text-teal-600 font-medium text-sm transition-colors">
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
      ) : (
        <div className="grid gap-4">
          {displayVenues.map((venue: any) => (
            <div key={venue.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow">
              <div className="w-full md:w-48 h-40 md:h-auto bg-teal-50 rounded-lg flex items-center justify-center text-teal-300 border border-teal-100 overflow-hidden">
                 <MapPin size={48} opacity={0.5} />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{venue.name}</h3>
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-md font-medium whitespace-nowrap ml-2">{venue.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin size={16} className="text-orange-500 flex-shrink-0"/> {venue.address} <span className="text-gray-400">• Cách {venue.distance}</span>
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Star size={16} className="text-yellow-400 fill-current" />
                    {Number(venue.rating).toFixed(1)} <span className="text-gray-400 font-normal">({venue.reviews} đánh giá)</span>
                  </div>
                  <button 
                    onClick={() => setSelectedMapVenue(venue)}
                    className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg font-medium hover:bg-teal-100 transition-colors text-sm"
                  >
                    Xem bản đồ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-teal-800 mb-4">Thêm địa điểm tập luyện</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên địa điểm</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại hình</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500"
                >
                  <option>Gym</option>
                  <option>Cầu lông</option>
                  <option>Bóng đá</option>
                  <option>Bơi lội</option>
                  <option>Yoga</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng cách từ trung tâm trường (VD: 1.5 km)</label>
                <input 
                  type="text" 
                  value={formData.distance}
                  onChange={e => setFormData({...formData, distance: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" 
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium">Hủy</button>
                <button type="submit" className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium">Lưu địa điểm</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedMapVenue && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-[70vh]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-teal-800">{selectedMapVenue.name}</h2>
                <p className="text-sm text-gray-500">{selectedMapVenue.address}</p>
              </div>
              <button onClick={() => setSelectedMapVenue(null)} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(selectedMapVenue.address + ' Ho Chi Minh City')}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setSelectedMapVenue(null)} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium">
                Đóng bản đồ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
