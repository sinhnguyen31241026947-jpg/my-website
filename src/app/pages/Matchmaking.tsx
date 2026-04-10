import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Clock, CheckCircle2, ShieldAlert, Users, Loader2, Plus, Calendar } from "lucide-react";
import { getMatches, createMatch, updateMatch, getProfile, updateProfile } from "../api";
import { useAuth } from "../components/AuthContext";
import { toast } from "sonner";

export function Matchmaking() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [sport, setSport] = useState("Cầu lông");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");

  const loadMatches = () => {
    setIsLoading(true);
    getMatches().then(data => {
      // Sort to show newest first
      const sorted = (data || []).filter(Boolean).sort((a: any, b: any) => 
        new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
      );
      setMatches(sorted);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      toast.error("Lỗi khi tải dữ liệu");
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập để đăng lịch!");
      return;
    }
    
    try {
      const newMatch = {
        authorId: user.id,
        authorName: user.user_metadata?.name || user.email?.split('@')[0] || "Người dùng ẩn danh",
        sport,
        startTime,
        endTime,
        note,
        status: 'open',
        applicants: []
      };
      
      await createMatch(newMatch);
      toast.success("Đăng lịch thành công!");
      setShowCreateForm(false);
      loadMatches();
    } catch (error) {
      toast.error("Lỗi khi đăng lịch");
    }
  };

  const handleApply = async (matchId: string, currentApplicants: any[]) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để ứng tuyển!");
      return;
    }
    
    // Check if already applied
    if (currentApplicants?.some((app: any) => app.id === user.id)) {
      toast.info("Bạn đã ứng tuyển vào lịch này rồi!");
      return;
    }

    try {
      const updatedApplicants = [...(currentApplicants || []), {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        appliedAt: new Date().toISOString()
      }];
      
      await updateMatch(matchId, { applicants: updatedApplicants });
      toast.success("Đã ứng tuyển thành công! Chờ người tạo phản hồi nhé.");
      loadMatches();
    } catch (error) {
      toast.error("Lỗi khi ứng tuyển");
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "Chưa rõ";
    return new Date(timeString).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
    });
  };

  if (isLoading && matches.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-teal-600">
        <Loader2 className="animate-spin" size={32} />
        <span className="ml-3 font-bold">Đang tải lịch linh động...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-teal-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-20 w-48 h-48 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight uppercase">Lịch Linh Động</h1>
            <p className="text-teal-100 max-w-lg text-sm md:text-base mb-6 font-medium">Thay vì cố định giờ giấc CLB, hãy treo bảng khung giờ trống của bạn để ghép đôi với người phù hợp. Không lo bùng kèo với Hệ thống Uy Tín mới!</p>
          </div>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 border border-orange-400 flex items-center justify-center gap-2"
          >
            {showCreateForm ? "Hủy đăng tin" : <><Plus size={18} /> Đăng Khung Giờ Rảnh</>}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white border-2 border-teal-100 rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-teal-900 mb-4 flex items-center gap-2">
            <Calendar className="text-orange-500" size={20} /> Tạo yêu cầu tìm buddy
          </h2>
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Môn thể thao</label>
                <select 
                  value={sport} onChange={e => setSport(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 text-sm font-medium"
                >
                  <option>Cầu lông</option>
                  <option>Tennis</option>
                  <option>Chạy bộ</option>
                  <option>Bóng rổ</option>
                  <option>Bơi lội</option>
                  <option>Gym</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Bắt đầu lúc</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={startTime} onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Kết thúc dự kiến</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={endTime} onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Ghi chú thêm (Trình độ, Địa điểm ưu tiên...)</label>
              <textarea 
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="VD: Mình là newbie, muốn tìm bạn đánh cầu lông ở Sân Ký túc xá..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 text-sm font-medium h-24 resize-none"
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-teal-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-900 transition-colors">
                Treo Bảng Ngay
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="flex justify-between items-center border-b-2 border-slate-100 pb-2">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab("all")}
            className={`pb-2 text-sm font-bold border-b-4 transition-colors ${activeTab === "all" ? "border-teal-800 text-teal-800" : "border-transparent text-slate-400 hover:text-slate-800"}`}
          >
            Đang mở
          </button>
          <button 
            onClick={() => setActiveTab("my-requests")}
            className={`pb-2 text-sm font-bold border-b-4 transition-colors ${activeTab === "my-requests" ? "border-teal-800 text-teal-800" : "border-transparent text-slate-400 hover:text-slate-800"}`}
          >
            Lịch của tôi
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(!matches || matches.filter(Boolean).length === 0) ? (
          <div className="col-span-2 text-center py-12 text-slate-500">
            <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="font-medium">Chưa có ai đăng khung giờ rảnh nào.</p>
            <p className="text-sm">Hãy là người đầu tiên treo bảng tìm đồng đội nhé!</p>
          </div>
        ) : matches.filter(m => m && (activeTab === "all" ? true : m.authorId === user?.id)).map((match, idx) => {
          const isMyRequest = match.authorId === user?.id;
          const hasApplied = match.applicants?.some((app: any) => app.id === user?.id);

          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={match.id || idx} 
              className={`bg-white rounded-2xl border-2 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col ${isMyRequest ? 'border-orange-200 bg-orange-50/30' : 'border-slate-100'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-lg uppercase border-2 border-white shadow-sm">
                    {match.authorName?.[0] || "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      {match.authorName}
                      {match.authorReputation ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded flex items-center gap-0.5" title="Điểm uy tín">
                          <CheckCircle2 size={10} /> {match.authorReputation}
                        </span>
                      ) : null}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock size={12} className="text-orange-500" /> {formatTime(match.startTime)} - {formatTime(match.endTime).split(' ')[1]}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                  match.status === "open" ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-slate-100 text-slate-500"
                }`}>
                  {match.status === "open" ? "Đang mở" : "Đã chốt"}
                </span>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl mb-4 flex-1 border border-slate-100 relative">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {match.note || "Tìm bạn tập chung khung giờ này. Đừng bùng kèo nhé!"}
                </p>
              </div>

              <div className="flex items-center justify-between mb-5">
                <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[11px] font-black uppercase tracking-wider border border-orange-100">
                  {match.sport}
                </span>
                
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Users size={14} /> {match.applicants?.length || 0} người ứng tuyển
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                {isMyRequest ? (
                  <div className="w-full space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Danh sách ứng viên ({match.applicants?.length || 0}):</p>
                    {(!match.applicants || match.applicants.length === 0) ? (
                      <p className="text-sm text-slate-400 italic">Chưa có ai ứng tuyển</p>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                        {match.applicants.map((app: any, appIdx: number) => (
                          <div key={appIdx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-sm font-semibold text-slate-700">{app.name}</span>
                            {match.status === "open" ? (
                              <button 
                                onClick={() => {
                                  updateMatch(match.id, { status: 'closed', acceptedApplicantId: app.id, acceptedApplicantName: app.name })
                                    .then(() => {
                                      toast.success(`Đã chốt kèo với ${app.name}!`);
                                      loadMatches();
                                    })
                                    .catch(() => {
                                      toast.error("Lỗi khi chốt kèo");
                                    });
                                }}
                                className="bg-teal-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-teal-700 transition-colors"
                              >
                                Chốt kèo
                              </button>
                            ) : match.acceptedApplicantId === app.id ? (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">Đã chọn</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                    {match.status === "closed" && (
                      <button 
                        onClick={() => {
                          updateMatch(match.id, { status: 'completed' })
                            .then(() => {
                              // Increase Creator's Reputation & Streak
                              if (user?.id) {
                                getProfile(user.id).then(creatorProfile => {
                                  if (creatorProfile) {
                                    updateProfile(user.id, { 
                                      reputationScore: (creatorProfile.reputationScore || 100) + 10,
                                      currentStreak: (creatorProfile.currentStreak || 0) + 1
                                    });
                                  }
                                });
                              }
                              
                              // Increase Applicant's Reputation
                              if (match.acceptedApplicantId) {
                                getProfile(match.acceptedApplicantId).then(applicantProfile => {
                                  if (applicantProfile) {
                                    updateProfile(match.acceptedApplicantId, { 
                                      reputationScore: (applicantProfile.reputationScore || 100) + 5,
                                      currentStreak: (applicantProfile.currentStreak || 0) + 1
                                    });
                                  }
                                });
                              }

                              toast.success("Đã hoàn thành! Điểm uy tín của cả hai đã được cộng thêm.");
                              loadMatches();
                            })
                            .catch(() => {
                              toast.error("Lỗi cập nhật uy tín");
                            });
                        }}
                        className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                      >
                        <CheckCircle2 size={18} /> Đánh dấu hoàn thành (+Uy Tín)
                      </button>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => handleApply(match.id, match.applicants)}
                    disabled={match.status !== "open" || hasApplied}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors ${
                      hasApplied 
                        ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 cursor-not-allowed"
                        : match.status === "open" 
                          ? "bg-teal-800 text-white hover:bg-teal-900 shadow-md shadow-teal-800/20" 
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {hasApplied ? <><CheckCircle2 size={18} /> Đã ứng tuyển</> : <><Users size={18} strokeWidth={2.5} /> Ứng tuyển ngay</>}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
