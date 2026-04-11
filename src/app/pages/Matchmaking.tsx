import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, CheckCircle2, Users, Loader2, Plus, Calendar, Search, Filter, Star, MessageCircle, Send, X, MapPin, Flag } from "lucide-react";
import { getMatches, createMatch, updateMatch, getProfile, updateProfile, getMessages, sendMessage, createReview, createReport } from "../api";
import { useAuth } from "../components/AuthContext";
import { toast } from "sonner";

const venuesBySport: Record<string, string[]> = {
  "Cầu lông": ["Sân Cầu Lông UEH Cơ sở B", "Sân Cầu Lông Phú Thọ", "Sân Cầu Lông Rạch Miễu"],
  "Tennis": ["Sân Tennis UEH", "Sân Tennis Tao Đàn", "Sân Tennis Phú Nhuận"],
  "Chạy bộ": ["Công viên Tao Đàn", "Công viên Gia Định", "Đường chạy UEH"],
  "Bóng rổ": ["Sân Bóng Rổ UEH", "Sân Bóng Rổ Lê Thị Riêng"],
  "Bơi lội": ["Hồ Bơi UEH", "Hồ Bơi Phú Thọ", "Hồ Bơi Lam Sơn"],
  "Gym": ["Phòng Gym UEH", "Phòng Gym California", "Phòng Gym Fit24"],
};

export function Matchmaking() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSport, setFilterSport] = useState("Tất cả");
  const [filterGender, setFilterGender] = useState("Tất cả");
  const [filterLevel, setFilterLevel] = useState("Tất cả");
  const [showFilters, setShowFilters] = useState(false);
  const [sport, setSport] = useState("Cầu lông");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(1);
  const [formGender, setFormGender] = useState("Tất cả");
  const [formLevel, setFormLevel] = useState("Tất cả");
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingMatch, setRatingMatch] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportMatch, setReportMatch] = useState<any>(null);

const loadMatches = () => {
    setIsLoading(true);
    getMatches().then(data => {
      console.log("RAW DATA:", data);
      const sorted = (data || [])
        .filter((m: any) => m !== null && m !== undefined && m.id)
        .sort((a: any, b: any) =>
          new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
        );
      console.log("FILTERED:", sorted);
      setMatches(sorted);
      setIsLoading(false);
    }).catch(() => {
      toast.error("Lỗi khi tải dữ liệu");
      setIsLoading(false);
    });
  };

  useEffect(() => { loadMatches(); }, [user]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredMatches = matches.filter(m => {
    if (!m) return false;
    const status = m.status || "open";
    if (activeTab === "my-requests" && m.authorId !== user?.id) return false;
    if (activeTab === "waiting-room") {
      return status === "closed" && (m.authorId === user?.id || m.acceptedApplicantId === user?.id);
    }
    if (activeTab === "all" && status !== "open") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!m.authorName?.toLowerCase().includes(q) && !m.note?.toLowerCase().includes(q) && !m.sport?.toLowerCase().includes(q)) return false;
    }
    if (filterSport !== "Tất cả" && m.sport !== filterSport) return false;
    if (filterGender !== "Tất cả" && m.gender !== filterGender) return false;
    if (filterLevel !== "Tất cả" && m.level !== filterLevel) return false;
    return true;
  });

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Vui lòng đăng nhập!"); return; }
    try {
      await createMatch({
        authorId: user.id,
        authorName: user.user_metadata?.name || user.email?.split('@')[0] || "Ẩn danh",
        sport, startTime, endTime, note,
        status: 'open', applicants: [],
        maxPlayers, gender: formGender, level: formLevel,
      });
      toast.success("Đăng lịch thành công!");
      setShowCreateForm(false);
      loadMatches();
    } catch { toast.error("Lỗi khi đăng lịch"); }
  };

  const handleApply = async (matchId: string, currentApplicants: any[]) => {
    if (!user) { toast.error("Vui lòng đăng nhập!"); return; }
    if (currentApplicants?.some((app: any) => app.id === user.id)) { toast.info("Bạn đã ứng tuyển rồi!"); return; }
    try {
      const updatedApplicants = [...(currentApplicants || []), {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        appliedAt: new Date().toISOString()
      }];
      await updateMatch(matchId, { applicants: updatedApplicants });
      toast.success("Ứng tuyển thành công!");
      loadMatches();
    } catch { toast.error("Lỗi khi ứng tuyển"); }
  };

  const handleOpenWaitingRoom = async (match: any) => {
    setSelectedMatch(match);
    setShowWaitingRoom(true);
    setIsLoadingMessages(true);
    try {
      const msgs = await getMessages(match.id);
      setMessages(msgs || []);
    } catch { setMessages([]); }
    setIsLoadingMessages(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch) return;
    try {
      const msg = {
        matchId: selectedMatch.id,
        senderId: user?.id,
        senderName: user?.user_metadata?.name || user?.email?.split('@')[0],
        content: newMessage,
        createdAt: new Date().toISOString()
      };
      await sendMessage(selectedMatch.id, msg);
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
    } catch { toast.error("Lỗi khi gửi tin nhắn"); }
  };

  const handleCompleteMatch = async (match: any) => {
    try {
      await updateMatch(match.id, { status: 'completed' });
      if (user?.id) {
        getProfile(user.id).then(p => {
          if (p) updateProfile(user.id, {
            reputationScore: (p.reputationScore || 100) + 10,
            currentStreak: (p.currentStreak || 0) + 1
          });
        });
      }
      if (match.acceptedApplicantId) {
        getProfile(match.acceptedApplicantId).then(p => {
          if (p) updateProfile(match.acceptedApplicantId, {
            reputationScore: (p.reputationScore || 100) + 5,
            currentStreak: (p.currentStreak || 0) + 1
          });
        });
      }
      toast.success("Hoàn thành! Điểm uy tín đã được cộng.");
      setShowWaitingRoom(false);
      setRatingMatch(match);
      setShowRatingModal(true);
      loadMatches();
    } catch { toast.error("Lỗi cập nhật"); }
  };

  const handleSubmitRating = async () => {
    if (!ratingMatch) return;
    try {
      const targetId = ratingMatch.authorId === user?.id ? ratingMatch.acceptedApplicantId : ratingMatch.authorId;
      await createReview({
        matchId: ratingMatch.id,
        reviewerId: user?.id,
        reviewerName: user?.user_metadata?.name || user?.email?.split('@')[0],
        targetId, rating, comment: ratingComment,
        createdAt: new Date().toISOString()
      });
      toast.success("Đã gửi đánh giá!");
      setShowRatingModal(false);
      setRating(5);
      setRatingComment("");
    } catch { toast.error("Lỗi khi gửi đánh giá"); }
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) { toast.error("Vui lòng nhập lý do báo cáo!"); return; }
    try {
      const targetId = reportMatch.authorId === user?.id ? reportMatch.acceptedApplicantId : reportMatch.authorId;
      await createReport({
        matchId: reportMatch.id,
        reporterId: user?.id,
        reporterName: user?.user_metadata?.name || user?.email?.split('@')[0],
        targetId, reason: reportReason,
        createdAt: new Date().toISOString()
      });
      if (targetId) {
        getProfile(targetId).then(p => {
          if (p) updateProfile(targetId, {
            reputationScore: Math.max(0, (p.reputationScore || 100) - 20)
          });
        });
      }
      toast.success("Đã gửi báo cáo!");
      setShowReportModal(false);
      setReportReason("");
      setReportMatch(null);
    } catch { toast.error("Lỗi khi gửi báo cáo"); }
  };

  const formatTime = (t: string) => {
    if (!t) return "Chưa rõ";
    return new Date(t).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

  if (isLoading && matches.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-teal-600">
        <Loader2 className="animate-spin" size={32} />
        <span className="ml-3 font-bold">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-teal-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-20 w-48 h-48 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight uppercase">Lịch Linh Động</h1>
            <p className="text-teal-100 max-w-lg text-sm md:text-base mb-6 font-medium">Treo bảng khung giờ trống để ghép đôi với người phù hợp. Không lo bùng kèo!</p>
          </div>
          <button onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center gap-2">
            {showCreateForm ? "Hủy" : <><Plus size={18} /> Đăng Khung Giờ Rảnh</>}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="bg-white border-2 border-teal-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-teal-900 mb-4 flex items-center gap-2">
            <Calendar className="text-orange-500" size={20} /> Tạo yêu cầu tìm buddy
          </h2>
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Môn thể thao</label>
                <select value={sport} onChange={e => setSport(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 text-sm font-medium">
                  {["Cầu lông","Tennis","Chạy bộ","Bóng rổ","Bơi lội","Gym"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Giới tính tìm</label>
                <select value={formGender} onChange={e => setFormGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 text-sm font-medium">
                  {["Tất cả","Nam","Nữ"].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Trình độ tìm</label>
                <select value={formLevel} onChange={e => setFormLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 text-sm font-medium">
                  {["Tất cả","Mới bắt đầu","Trung bình","Khá","Chuyên nghiệp"].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Số người cần tìm</label>
                <input type="number" min={1} max={20} value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 text-sm font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Bắt đầu lúc</label>
                <input type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 text-sm font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Kết thúc dự kiến</label>
                <input type="datetime-local" required value={endTime} onChange={e => setEndTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 text-sm font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Ghi chú (Địa điểm, yêu cầu...)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="VD: Tìm bạn đánh cầu lông ở Sân KTX, mình newbie..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 text-sm font-medium h-24 resize-none"></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-teal-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-900 transition-colors">Treo Bảng Ngay</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Tìm kiếm theo tên, môn chơi, ghi chú..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-teal-500" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl border-2 font-bold text-sm flex items-center gap-2 transition-colors ${showFilters ? 'bg-teal-800 text-white border-teal-800' : 'bg-white border-slate-100 text-slate-600'}`}>
            <Filter size={16} /> Lọc
          </button>
        </div>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-white border-2 border-slate-100 rounded-2xl p-4 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Môn chơi</label>
              <select value={filterSport} onChange={e => setFilterSport(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none">
                {["Tất cả","Cầu lông","Tennis","Chạy bộ","Bóng rổ","Bơi lội","Gym"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Giới tính</label>
              <select value={filterGender} onChange={e => setFilterGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none">
                {["Tất cả","Nam","Nữ"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Trình độ</label>
              <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none">
                {["Tất cả","Mới bắt đầu","Trung bình","Khá","Chuyên nghiệp"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex gap-6 border-b-2 border-slate-100 pb-2">
        {[{key:"all",label:"Đang mở"},{key:"my-requests",label:"Lịch của tôi"},{key:"waiting-room",label:"Phòng chờ"}].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`pb-2 text-sm font-bold border-b-4 transition-colors ${activeTab === tab.key ? "border-teal-800 text-teal-800" : "border-transparent text-slate-400 hover:text-slate-800"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredMatches.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500">
            <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="font-medium">Không có kết quả nào.</p>
          </div>
        ) : filteredMatches.map((match, idx) => {
          const isMyRequest = match.authorId === user?.id;
          const hasApplied = match.applicants?.some((app: any) => app.id === user?.id);
          const joinedCount = match.applicants?.length || 0;
          const maxCount = match.maxPlayers || 1;
          const isFull = joinedCount >= maxCount;
          return (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              key={match.id || idx}
              className={`bg-white rounded-2xl border-2 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col ${isMyRequest ? 'border-orange-200 bg-orange-50/30' : 'border-slate-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-lg uppercase border-2 border-white shadow-sm">
                    {match.authorName?.[0] || "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{match.authorName}</h3>
                    <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock size={12} className="text-orange-500" /> {formatTime(match.startTime)} - {formatTime(match.endTime).split(' ')[1]}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                  match.status === "open" ? "bg-teal-50 text-teal-700 border border-teal-100" :
                  match.status === "closed" ? "bg-orange-50 text-orange-600 border border-orange-100" :
                  "bg-slate-100 text-slate-500"}`}>
                  {match.status === "open" ? "Đang mở" : match.status === "closed" ? "Đã chốt" : "Hoàn thành"}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl mb-4 flex-1 border border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{match.note || "Tìm bạn tập chung khung giờ này!"}</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[11px] font-black uppercase border border-orange-100">{match.sport}</span>
                {match.gender && match.gender !== "Tất cả" && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-black uppercase border border-blue-100">{match.gender}</span>
                )}
                {match.level && match.level !== "Tất cả" && (
                  <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[11px] font-black uppercase border border-purple-100">{match.level}</span>
                )}
                <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase border flex items-center gap-1 ${isFull ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                  <Users size={11} /> {joinedCount}/{maxCount} người
                </span>
              </div>
              <div className="flex gap-2 mt-auto">
                {isMyRequest ? (
                  <div className="w-full space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase">Ứng viên ({joinedCount}/{maxCount}):</p>
                    {(!match.applicants || match.applicants.length === 0) ? (
                      <p className="text-sm text-slate-400 italic">Chưa có ai ứng tuyển</p>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {match.applicants.map((app: any, i: number) => (
                          <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-sm font-semibold text-slate-700">{app.name}</span>
                            {match.status === "open" ? (
                              <button onClick={() => {
                                updateMatch(match.id, { status: 'closed', acceptedApplicantId: app.id, acceptedApplicantName: app.name })
                                  .then(() => { toast.success(`Đã chốt kèo với ${app.name}!`); loadMatches(); })
                                  .catch(() => toast.error("Lỗi khi chốt kèo"));
                              }} className="bg-teal-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-teal-700">Chốt kèo</button>
                            ) : match.acceptedApplicantId === app.id ? (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">Đã chọn</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                    {match.status === "closed" && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleOpenWaitingRoom(match)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
                          <MessageCircle size={16} /> Phòng chờ
                        </button>
                        <button onClick={() => handleCompleteMatch(match)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 bg-orange-500 text-white hover:bg-orange-600">
                          <CheckCircle2 size={16} /> Hoàn thành
                        </button>
                      </div>
                    )}
                  </div>
                ) : match.status === "closed" && match.acceptedApplicantId === user?.id ? (
                  <button onClick={() => handleOpenWaitingRoom(match)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
                    <MessageCircle size={16} /> Vào Phòng Chờ
                  </button>
                ) : (
                  <button onClick={() => handleApply(match.id, match.applicants)}
                    disabled={match.status !== "open" || hasApplied || isFull}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors ${
                      hasApplied ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 cursor-not-allowed" :
                      isFull ? "bg-red-50 text-red-400 border-2 border-red-100 cursor-not-allowed" :
                      match.status === "open" ? "bg-teal-800 text-white hover:bg-teal-900" :
                      "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                    {hasApplied ? <><CheckCircle2 size={16} /> Đã ứng tuyển</> :
                     isFull ? <><X size={16} /> Đã đủ người</> :
                     <><Users size={16} /> Ứng tuyển ngay</>}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Waiting Room Modal */}
      <AnimatePresence>
        {showWaitingRoom && selectedMatch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="font-black text-teal-900 text-lg">Phòng Chờ</h2>
                  <p className="text-xs text-slate-500 font-medium">{selectedMatch.sport} • {formatTime(selectedMatch.startTime)}</p>
                </div>
                <button onClick={() => setShowWaitingRoom(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-2">THÀNH VIÊN</p>
                <div className="flex gap-2 mb-3">
                  <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold">👑 {selectedMatch.authorName}</span>
                  {selectedMatch.acceptedApplicantName && (
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">✅ {selectedMatch.acceptedApplicantName}</span>
                  )}
                </div>
                {/* Gợi ý địa điểm */}
                <div className="bg-white rounded-xl p-3 border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                    <MapPin size={12} className="text-orange-500" /> GỢI Ý ĐỊA ĐIỂM CHO {selectedMatch.sport?.toUpperCase()}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(venuesBySport[selectedMatch.sport] || ["Chưa có gợi ý"]).map((venue, i) => (
                      <span key={i} className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-xs font-semibold border border-orange-100">
                        📍 {venue}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingMessages ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-teal-600" size={24} /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Chưa có tin nhắn nào</p>
                    <p className="text-xs">Hãy bắt đầu trò chuyện!</p>
                  </div>
                ) : messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium ${msg.senderId === user?.id ? 'bg-teal-800 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                      {msg.senderId !== user?.id && <p className="text-[10px] font-bold mb-1 opacity-60">{msg.senderName}</p>}
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-slate-100 flex gap-2">
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nhắn tin..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500" />
                <button onClick={handleSendMessage}
                  className="bg-teal-800 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-teal-900">
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
              <h2 className="font-black text-teal-900 text-xl mb-1">Đánh Giá Buổi Chơi</h2>
              <p className="text-sm text-slate-500 mb-6">Chia sẻ trải nghiệm của bạn!</p>
              <div className="flex justify-center gap-2 mb-6">
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => setRating(star)}>
                    <Star size={36} className={star <= rating ? 'text-orange-400 fill-orange-400' : 'text-slate-200 fill-slate-200'} />
                  </button>
                ))}
              </div>
              <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)}
                placeholder="Nhận xét về buổi chơi, đối tác của bạn..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 h-24 resize-none mb-4" />
              <div className="flex gap-3">
                <button onClick={() => { setShowRatingModal(false); setReportMatch(ratingMatch); setShowReportModal(true); }}
                  className="flex-1 py-2.5 rounded-xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 flex items-center justify-center gap-2">
                  <Flag size={16} /> Báo Cáo
                </button>
                <button onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">
                  Bỏ qua
                </button>
                <button onClick={handleSubmitRating}
                  className="flex-1 py-2.5 rounded-xl bg-teal-800 text-white font-bold text-sm hover:bg-teal-900">
                  Gửi Đánh Giá
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
              <h2 className="font-black text-red-600 text-xl mb-1 flex items-center gap-2">
                <Flag size={20} /> Báo Cáo Người Chơi
              </h2>
              <p className="text-sm text-slate-500 mb-6">Bạn muốn báo cáo người này? Hệ thống sẽ trừ 20 điểm uy tín của họ.</p>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Lý do báo cáo</label>
                <div className="space-y-2 mb-3">
                  {["Bùng kèo không báo trước","Thái độ không tốt","Thông tin sai sự thật","Quấy rối","Lý do khác"].map(reason => (
                    <button key={reason} onClick={() => setReportReason(reason)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${reportReason === reason ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}>
                      {reason}
                    </button>
                  ))}
                </div>
                <textarea value={reportReason} onChange={e => setReportReason(e.target.value)}
                  placeholder="Hoặc nhập lý do cụ thể..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 h-20 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowReportModal(false); setReportReason(""); }}
                  className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">
                  Hủy
                </button>
                <button onClick={handleSubmitReport}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 flex items-center justify-center gap-2">
                  <Flag size={16} /> Gửi Báo Cáo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}