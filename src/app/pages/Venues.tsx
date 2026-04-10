import { useState, useEffect } from "react";
import { Search, MapPin, Star, Filter, Tag, Loader2, Plus } from "lucide-react";
import { getVenues, createVenue } from "../api";
import { useAuth } from "../components/AuthContext";
import { motion } from "motion/react";
import { toast } from "sonner";

export function Venues() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("Tất cả");
  const [venues, setVenues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const categories = ["Tất cả", "Gym", "Cầu lông", "Bóng đá", "Yoga"];

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("Cầu lông");
  const [campus, setCampus] = useState("Cơ sở B");

  const loadVenues = () => {
    setIsLoading(true);
    getVenues().then(data => {
      setVenues(data || []);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sân!");
      return;
    }
    
    try {
      await createVenue({
        name,
        type,
        campus,
        image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=800&q=80", // placeholder
        distance: "Gần bạn",
        rating: 5.0,
        price: "Liên hệ",
        isPartner: false
      });
      toast.success("Thêm sân thành công!");
      setShowCreateForm(false);
      loadVenues();
    } catch (error) {
      toast.error("Lỗi khi thêm sân");
    }
  };

  const filteredVenues = filter === "Tất cả" 
    ? venues 
    : venues.filter(v => v.type === filter);

  if (isLoading && venues.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-teal-600">
        <Loader2 className="animate-spin" size={32} />
        <span className="ml-3 font-bold">Đang tải dữ liệu địa điểm...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-teal-900 uppercase tracking-tight">Địa điểm tập luyện</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Tìm phòng gym, sân bãi giá tốt gần cơ sở UEH của bạn.</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 border border-orange-400 flex items-center gap-2"
        >
          {showCreateForm ? "Hủy đăng" : <><Plus size={18} /> Thêm sân mới</>}
        </button>
      </div>

      {showCreateForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white border-2 border-teal-100 rounded-2xl p-6 shadow-sm mb-6"
        >
          <h2 className="text-lg font-bold text-teal-900 mb-4">Thông tin sân</h2>
          <form onSubmit={handleCreateVenue} className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tên sân</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full border-2 rounded-xl p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Loại sân</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full border-2 rounded-xl p-2 text-sm">
                <option>Cầu lông</option><option>Gym</option><option>Bóng đá</option><option>Yoga</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Gần cơ sở</label>
              <select value={campus} onChange={e => setCampus(e.target.value)} className="w-full border-2 rounded-xl p-2 text-sm">
                <option>Cơ sở B</option><option>Cơ sở A</option><option>Cơ sở N</option><option>Ký túc xá</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="bg-teal-800 text-white px-6 py-2 rounded-xl font-bold">Thêm vào hệ thống</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600" size={18} strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc khu vực..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-sm font-medium transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                filter === cat 
                  ? "bg-teal-800 text-white shadow-md" 
                  : "bg-white border-2 border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-700"
              }`}
            >
              {cat}
            </button>
          ))}
          <button className="px-4 py-2.5 rounded-xl text-sm font-bold bg-orange-50 border-2 border-orange-100 text-orange-600 hover:bg-orange-100 flex items-center gap-2 transition-colors">
            <Filter size={16} strokeWidth={2.5} /> Lọc thêm
          </button>
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!filteredVenues || filteredVenues.filter(Boolean).length === 0) ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            <MapPin size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="font-medium">Chưa có địa điểm nào trong hệ thống.</p>
            <p className="text-sm">Hãy là người đầu tiên thêm địa điểm tập luyện mới!</p>
          </div>
        ) : filteredVenues.filter(Boolean).map((venue, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={venue.id || idx} 
            className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-100 transition-all flex flex-col group"
          >
            <div className="h-48 relative w-full overflow-hidden">
              <img src={venue.image} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {venue.isPartner && (
                <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-lg shadow-md flex items-center gap-1 uppercase tracking-wider">
                  <Tag size={12} strokeWidth={3} /> UEH Deal
                </div>
              )}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-slate-800 text-xs font-bold px-2 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
                <Star size={12} className="text-amber-500 fill-amber-500" /> {venue.rating}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-lg text-slate-800 leading-tight group-hover:text-teal-800 transition-colors">{venue.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-teal-50 text-teal-700 rounded-md whitespace-nowrap ml-2">
                  {venue.type}
                </span>
              </div>
              
              <div className="space-y-2 mt-2 flex-1">
                <p className="text-sm text-slate-500 flex items-start gap-2">
                  <MapPin size={16} className="text-orange-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                  <span>
                    <span className="font-bold text-slate-700">{venue.campus}</span>
                    <br /><span className="text-xs">Cách {venue.distance}</span>
                  </span>
                </p>
                
                <div className="pt-3 mt-3 border-t-2 border-slate-50 flex justify-between items-center bg-slate-50 -mx-5 px-5 pb-1 rounded-b-xl">
                  <div className="text-sm">
                    <span className="text-slate-500 font-medium text-xs">Mức giá</span><br/>
                    <span className="font-black text-teal-700">{venue.price}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">{venue.priceRange}</p>
                </div>
              </div>

              <button className="w-full mt-4 py-3 bg-white border-2 border-teal-800 text-teal-800 font-bold rounded-xl text-sm hover:bg-teal-800 hover:text-white transition-colors">
                Xem chi tiết
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
