import { useState, useEffect } from "react";
import { Users, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { getGroups } from "../api";
import { motion } from "motion/react";

export function Groups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getGroups().then(data => {
      setGroups(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-teal-600">
        <Loader2 className="animate-spin" size={32} />
        <span className="ml-3 font-bold">Đang tải dữ liệu hội nhóm...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end bg-teal-50 p-6 rounded-2xl border border-teal-100">
        <div>
          <h1 className="text-2xl font-black text-teal-900 uppercase tracking-tight">Hội Nhóm Thể Thao</h1>
          <p className="text-teal-700 text-sm mt-1 font-medium">Khám phá và tham gia các câu lạc bộ, hội nhóm sôi nổi của sinh viên UEH.</p>
        </div>
        <button className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-md hidden md:block border border-orange-400">
          + Tạo Nhóm Mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(!groups || groups.filter(Boolean).length === 0) ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="font-medium">Chưa có hội nhóm nào được tạo.</p>
            <p className="text-sm">Hãy khởi xướng cộng đồng thể thao của riêng bạn!</p>
          </div>
        ) : groups.filter(Boolean).map((group, idx) => (
          <motion.div 
            whileHover={{ y: -4 }}
            key={group.id || idx} 
            className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row group"
          >
            <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden">
              <img src={group.cover} alt={group.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-teal-800/90 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-black text-white shadow-sm uppercase tracking-wider">
                {group.type}
              </div>
            </div>
            
            <div className="p-5 sm:w-3/5 flex flex-col justify-between bg-white">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-lg text-slate-800 group-hover:text-teal-800 transition-colors">{group.name}</h3>
                  <div className="flex items-center gap-1.5 text-orange-600 text-xs font-bold bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                    <Users size={14} strokeWidth={2.5} /> {group.members}
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3 font-medium">
                  {group.description}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="bg-slate-50 text-slate-700 text-xs p-3 rounded-xl flex items-start gap-2 border border-slate-100">
                  <Calendar size={16} className="mt-0.5 shrink-0 text-teal-600" strokeWidth={2.5} />
                  <span className="font-semibold leading-relaxed">
                    <span className="text-teal-800 uppercase text-[10px] tracking-wider block mb-0.5">Sự kiện tiếp theo</span>
                    {group.nextActivity}
                  </span>
                </div>
                <button className="w-full py-2.5 bg-white border-2 border-teal-800 text-teal-800 font-bold rounded-xl text-sm hover:bg-teal-800 hover:text-white transition-colors flex justify-center items-center gap-2">
                  Xem chi tiết cộng đồng <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Mobile action button */}
      <button className="w-full bg-orange-500 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-orange-600 shadow-md transition-colors md:hidden mt-4">
        + Tạo Nhóm Mới
      </button>
    </div>
  );
}
