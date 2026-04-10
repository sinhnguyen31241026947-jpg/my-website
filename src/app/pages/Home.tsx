import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Flame, MapPin, Activity, Users, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { getVenues, getMatches } from "../api";
import bannerImg from "../../imports/banner.png.png";

export function Home() {
  const [venues, setVenues] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getVenues(), getMatches()]).then(([venuesData, usersData]) => {
      setVenues(venuesData);
      setUsers(usersData);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-teal-600">
        <Loader2 className="animate-spin" size={48} />
        <span className="ml-4 text-xl font-bold">Đang tải trang chủ...</span>
      </div>
    );
  }

  return (
    <div className="pb-16 md:pb-0">
      {/* Hero Banner */}
      <section className="w-full relative bg-slate-900 flex justify-center items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={bannerImg} 
            alt="UEH Sports Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/90 via-teal-950/60 to-transparent" />
        </div>
        
        <div className="relative w-full max-w-5xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 bg-orange-500/20 text-orange-400 font-bold uppercase tracking-widest text-xs rounded-full border border-orange-500/30 mb-6 inline-block">
              Nền tảng thể thao sinh viên
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
              Kết Nối <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">Đam Mê</span>
            </h1>
            <p className="text-slate-300 text-base md:text-xl mb-10 max-w-2xl font-medium leading-relaxed">
              Cộng đồng thể thao lớn nhất dành cho sinh viên UEH. Cùng nhau tập luyện, cùng nhau phát triển.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link 
                to="/match" 
                className="bg-orange-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 w-full sm:w-auto justify-center text-sm md:text-base"
              >
                Bắt Đầu Ngay <ArrowRight size={20} />
              </Link>
              <Link 
                to="/venues" 
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center text-sm md:text-base"
              >
                Tìm Sân Tập
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Container cho các section bên dưới */}
      <div className="max-w-5xl mx-auto w-full p-4 md:p-6 space-y-10">
        {/* Quick Stats / Shortcuts */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Deal phòng tập", value: "12 Ưu đãi", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Đang tìm bạn", value: "34 Yêu cầu", icon: Users, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Địa điểm gần đây", value: "8 Nơi", icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Sự kiện sắp tới", value: "3 Sự kiện", icon: Activity, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-teal-100 transition-colors">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={stat.color} size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</p>
              <p className="font-black text-slate-800 text-lg">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recommended Venues */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-teal-900 flex items-center gap-2">
              <MapPin size={20} className="text-orange-500" /> Địa điểm gần UEH
            </h3>
            <Link to="/venues" className="text-sm text-teal-600 font-bold flex items-center hover:underline">
              Xem tất cả <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {!venues || venues.filter(Boolean).length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">Chưa có địa điểm nào.</div>
            ) : venues.filter(Boolean).slice(0, 3).map((venue, idx) => (
              <motion.div whileHover={{ y: -2 }} key={venue.id || idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex hover:shadow-md transition-all">
                <div className="w-1/3 h-28 sm:h-auto relative">
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                  {venue.isPartner && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      UEH Deal
                    </div>
                  )}
                </div>
                <div className="p-3 w-2/3 flex flex-col justify-center">
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{venue.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                    <MapPin size={12} className="text-teal-600" /> {venue.campus} <span className="text-slate-300">•</span> {venue.distance}
                  </p>
                  <div className="mt-3 flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                    <span className="text-xs font-bold text-teal-700">{venue.type}</span>
                    <span className="text-xs text-orange-600 font-black">{venue.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Matchmaking Requests */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-teal-900 flex items-center gap-2">
              <Activity size={20} className="text-orange-500" /> Bảng tin tìm Buddy
            </h3>
            <Link to="/match" className="text-sm text-teal-600 font-bold flex items-center hover:underline">
              Ghép cặp ngay <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {!users || users.filter(Boolean).length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">Chưa có ai treo bảng tìm bạn.</div>
            ) : users.filter(Boolean).slice(0, 3).map((match, idx) => (
              <motion.div whileHover={{ y: -2 }} key={match.id || idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm uppercase">
                    {match.authorName?.[0] || "?"}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{match.authorName}</h4>
                        <p className="text-[11px] font-medium text-slate-500">
                          {match.startTime ? new Date(match.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : ''}
                        </p>
                      </div>
                      <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold uppercase">{match.sport}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2 bg-slate-50 p-2 rounded-lg italic">"{match.note || "Tìm bạn chơi chung!"}"</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
