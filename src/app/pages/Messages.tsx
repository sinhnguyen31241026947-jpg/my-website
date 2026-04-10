import { useState } from "react";
import { Search, MoreVertical, Phone, Video, Info, Image as ImageIcon, Smile, Paperclip, Send, MessageCircle, ChevronLeft } from "lucide-react";
import { useAuth } from "../components/AuthContext";

const mockChats = [
  {
    id: 1,
    name: "Đoàn Hoàng Tường Vy",
    avatar: "",
    lastMessage: "Chừng nào đi tập vậy?",
    time: "10:30",
    unread: 1,
    online: true,
  },
  {
    id: 2,
    name: "Nguyễn Lê Thi",
    avatar: "",
    lastMessage: "Ok, mai gặp nhé!",
    time: "Hôm qua",
    unread: 0,
    online: false,
  }
];

export function Messages() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState(mockChats[0]);
  const [showChatDetail, setShowChatDetail] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [messages, setMessages] = useState<Record<number, {text: string, isMine: boolean}[]>>({
    1: [{ text: "Chừng nào đi tập vậy?", isMine: false }],
    2: [{ text: "Ok, mai gặp nhé!", isMine: false }],
  });

  const handleSend = () => {
    if (!msgInput.trim()) return;
    
    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [
        ...(prev[activeChat.id] || []),
        { text: msgInput.trim(), isMine: true }
      ]
    }));
    setMsgInput("");
  };

  const renderAvatar = (chat: { name: string, avatar: string }, className: string, textClass: string) => {
    if (chat.avatar) {
      return <img src={chat.avatar} alt={chat.name} className={`${className} object-cover`} />;
    }
    const initials = chat.name.split(' ').slice(-2).map(n => n[0]).join('').toUpperCase();
    return (
      <div className={`${className} bg-teal-100 text-teal-700 flex items-center justify-center font-bold ${textClass}`}>
        {initials}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full min-h-[70vh]">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md mx-4">
          <MessageCircle className="mx-auto w-16 h-16 text-teal-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Đăng nhập để nhắn tin</h2>
          <p className="text-slate-500 text-sm">Tham gia cùng cộng đồng thể thao và kết nối với bạn bè!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 md:static md:h-screen flex bg-white overflow-hidden border-l border-slate-200">
      {/* Left Sidebar - Chat List */}
      <div className={`w-full md:w-80 lg:w-96 flex-col border-r border-slate-100 bg-slate-50/50 ${showChatDetail ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 bg-white md:bg-transparent">
          <h1 className="text-2xl font-black text-slate-800 mb-4">Tin nhắn</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm người dùng, nhóm..." 
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {mockChats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => { setActiveChat(chat); setShowChatDetail(true); }}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeChat.id === chat.id ? 'bg-teal-50 border border-teal-100' : 'hover:bg-slate-100 border border-transparent'}`}
            >
              <div className="relative">
                {renderAvatar(chat, "w-12 h-12 rounded-full border border-slate-200", "text-lg")}
                {chat.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-sm text-slate-800 truncate pr-2">{chat.name}</h3>
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{chat.time}</span>
                </div>
                <p className={`text-xs truncate ${chat.unread > 0 ? 'text-slate-800 font-bold' : 'text-slate-500 font-medium'}`}>
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar - Chat View */}
      <div className={`flex-1 flex-col bg-white ${showChatDetail ? 'flex' : 'hidden md:flex'}`}>
        {/* Chat Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-100 shadow-sm z-10 bg-white">
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => setShowChatDetail(false)} className="md:hidden p-1.5 -ml-1 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="relative">
              {renderAvatar(activeChat, "w-10 h-10 rounded-full", "text-sm")}
              {activeChat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>}
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm md:text-base">{activeChat.name}</h2>
              <p className="text-[11px] md:text-xs text-emerald-600 font-medium">{activeChat.online ? 'Đang hoạt động' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 text-slate-500">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Phone size={18} className="md:w-5 md:h-5" /></button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Video size={18} className="md:w-5 md:h-5" /></button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors hidden md:block"><Info size={20} /></button>
          </div>
        </div>

        {/* Chat Messages View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 flex flex-col justify-end space-y-4">
          <div className="text-center text-xs text-slate-400 font-medium my-4">Hôm nay</div>
          
          {messages[activeChat.id]?.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.isMine ? 'justify-end self-end' : 'justify-start'}`}>
              {!msg.isMine && (
                <div className="hidden md:block">
                  {renderAvatar(activeChat, "w-8 h-8 rounded-full self-end", "text-xs")}
                </div>
              )}
              <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                msg.isMine 
                  ? 'bg-teal-600 text-white rounded-br-sm' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-3 md:p-4 border-t border-slate-100 bg-white pb-[env(safe-area-inset-bottom,12px)]">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 p-1.5 md:p-2 rounded-2xl focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
            <div className="flex items-center gap-0.5 md:gap-1 pb-1 hidden sm:flex">
              <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors rounded-full hover:bg-slate-200/50"><Smile size={20} /></button>
              <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors rounded-full hover:bg-slate-200/50"><Paperclip size={20} /></button>
            </div>
            <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors rounded-full hover:bg-slate-200/50 sm:hidden pb-1.5"><ImageIcon size={20} /></button>
            <textarea 
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Nhập tin nhắn..." 
              className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-slate-800 resize-none max-h-32 placeholder:text-slate-400"
              rows={1}
            />
            <button 
              onClick={handleSend}
              className={`p-2 md:p-2.5 rounded-xl transition-all shadow-sm mb-0.5 ${msgInput.trim() ? 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-md' : 'bg-slate-200 text-slate-400'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
