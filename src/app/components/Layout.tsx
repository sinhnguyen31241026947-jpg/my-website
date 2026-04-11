import { Outlet, Link, useLocation } from "react-router";
import { Users, MapPin, Home, LogIn, LogOut, User, Dumbbell, MessageCircle, X, Send, Globe, Shield } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useState, useRef, useEffect } from "react";

export function Layout() {
  const location = useLocation();
  const { session, user, isAdmin, signOut } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{sender: string, text: string, isBot: boolean}[]>([
    { sender: 'bot', text: 'Chào bạn! Mình là AI Assistant của UEH Flex-Fit Connect. Mình có thể giúp bạn tìm lịch trống hoặc sân bãi nhé!', isBot: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user', text: chatInput, isBot: false };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setTimeout(() => {
      const text = userMsg.text.toLowerCase();
      let botReply = "Xin lỗi, mình chưa hiểu ý bạn. Bạn có thể hỏi về sân cầu lông, phòng gym hoặc cách tìm buddy nhé!";
      if (text.includes("chơi ở đâu") || text.includes("tìm sân") || text.includes("cầu lông")) {
        botReply = "🤖 Gợi ý: Hiện tại Sân Cầu Lông UEH Cơ sở B (Cách 500m) đang có 2 nhóm cần buddy từ 18:00 - 20:00 hôm nay. Bạn vào mục 'Ghép cặp' để xem nhé!";
      } else if (text.includes("uy tín") || text.includes("streak") || text.includes("điểm")) {
        botReply = "Hệ thống Uy Tín giúp ngăn chặn bùng kèo. Bạn sẽ được +5 điểm mỗi lần tham gia đúng giờ và nhận Huy hiệu khi duy trì Streak 7 ngày đấy!";
      } else if (text.includes("chào") || text.includes("hi") || text.includes("hello")) {
        botReply = "Chào UEHer! Chúc bạn một ngày năng động. Mình có thể hỗ trợ gợi ý sân tập, tìm buddy trống lịch, hoặc hướng dẫn về luật Uy Tín. Bạn cần gì nào?";
      } else if (text.includes("giá") || text.includes("tiền") || text.includes("rẻ")) {
        botReply = "UEH Flex-Fit Connect luôn có những deal xịn cho sinh viên! Bạn có thể xem các phòng gym giảm 50% hoặc sân tennis đồng giá 50k/h trong mục 'Địa điểm' nhé!";
      } else if (text.includes("bùng kèo") || text.includes("report") || text.includes("tố cáo")) {
        botReply = "Nếu ai đó bùng kèo, bạn có thể vào mục lịch sử ghép cặp và nhấn nút 'Báo cáo'. Hệ thống sẽ trừ ngay 20 Điểm Uy Tín của người đó.";
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply, isBot: true }]);
    }, 1000);
  };

  const navItems = [
    { path: "/", label: "Trang chủ", icon: Home },
    { path: "/feed", label: "Cộng đồng", icon: Globe },
    { path: "/match", label: "Ghép cặp", icon: Users },
    { path: "/venues", label: "Địa điểm", icon: MapPin },
    { path: "/messages", label: "Tin nhắn", icon: MessageCircle },
    ...(isAdmin ? [{ path: "/admin", label: "Quản Trị", icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen shadow-sm z-50">
        <div className="p-6">
          <Link to="/" className="text-xl font-black flex items-center gap-3 text-slate-800">
            <span className="bg-gradient-to-br from-teal-500 to-teal-700 text-white p-2 rounded-xl shadow-lg shadow-teal-500/30">
              <Dumbbell size={24} />
            </span>
            <span className="leading-tight">UEH<br/><span className="text-teal-600">Flex-Fit</span></span>
          </Link>
        </div>
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                <Icon size={20} className={isActive ? "text-teal-600" : ""} />
                {item.label}
              </Link>
            )
          })}
        </div>
        <div className="p-4 border-t border-slate-100">
          {session ? (
            <div className="flex flex-col gap-2">
              <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold overflow-hidden border border-teal-200">
                  {user?.user_metadata?.avatar_url ? <img src={user?.user_metadata?.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : <User size={20} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm text-slate-800 truncate">{user?.user_metadata?.name || user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </Link>
              <button onClick={signOut} className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors">
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/auth" className="flex items-center justify-center gap-2 w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md shadow-teal-600/20">
              <LogIn size={18} /> Đăng nhập ngay
            </Link>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <header className="md:hidden bg-white text-slate-800 shadow-sm sticky top-0 z-40 border-b border-slate-200">
          <div className="px-4 py-3 flex justify-between items-center">
            <Link to="/" className="text-xl font-black flex items-center gap-2 text-slate-800">
              <span className="bg-gradient-to-br from-teal-500 to-teal-700 text-white p-1.5 rounded-lg shadow-sm">
                <Dumbbell size={20} />
              </span>
              UEH Flex-Fit Connect
            </Link>
            <div className="flex items-center">
              {session ? (
                <Link to="/profile" className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold overflow-hidden border border-teal-200">
                  {user?.user_metadata?.avatar_url ? <img src={user?.user_metadata?.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : <User size={16} />}
                </Link>
              ) : (
                <Link to="/auth" className="text-teal-600 font-bold text-sm bg-teal-50 px-3 py-1.5 rounded-lg">Đăng nhập</Link>
              )}
            </div>
          </div>
        </header>

        <main className={`flex-grow w-full relative ${location.pathname === '/' || location.pathname.startsWith('/messages') ? '' : 'p-4 md:p-8 max-w-5xl mx-auto'} mb-16 md:mb-0`}>
          <Outlet />
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 ${isActive ? 'text-teal-600' : 'text-gray-500'}`}>
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {session && !location.pathname.startsWith('/messages') && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end">
          {isChatOpen && (
            <div className="bg-white border border-teal-100 shadow-2xl rounded-2xl w-80 max-h-96 mb-4 flex flex-col overflow-hidden">
              <div className="bg-teal-700 text-white p-3 flex justify-between items-center shadow-md">
                <span className="font-bold flex items-center gap-2"><Dumbbell size={16} /> UEH Assistant</span>
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-teal-600 p-1 rounded-md transition-colors"><X size={18} /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 text-sm max-h-64">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] p-2.5 rounded-xl text-slate-800 shadow-sm leading-relaxed ${msg.isBot ? 'bg-white border border-slate-100 rounded-tl-sm' : 'bg-orange-100 border border-orange-200 rounded-tr-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  placeholder="Nhập 'Tìm sân', 'Uy tín'..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500" />
                <button type="submit" disabled={!chatInput.trim()} className="bg-orange-500 text-white p-2 rounded-xl disabled:bg-orange-300">
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
          <button onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-orange-500 hover:bg-orange-600 text-white w-14 h-14 rounded-full shadow-lg shadow-orange-500/40 flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
            {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
          </button>
        </div>
      )}
    </div>
  );
}