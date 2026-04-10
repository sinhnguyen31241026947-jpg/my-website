import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Image as ImageIcon, Flame, Heart, MessageCircle, Share2, Award, Loader2, Send } from "lucide-react";
import { getPosts, createPost, likePost, getProfile } from "../api";
import { useAuth } from "../components/AuthContext";
import { toast } from "sonner";

export function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState("");
  const [profile, setProfile] = useState<any>(null);

  const loadPosts = () => {
    setIsLoading(true);
    getPosts().then(data => {
      const sorted = (data || []).filter(Boolean).sort((a: any, b: any) => 
        new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
      );
      setPosts(sorted);
      setIsLoading(false);
    }).catch(() => {
      toast.error("Lỗi tải bài viết");
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadPosts();
    if (user) {
      getProfile(user.id).then(data => {
        if (data) setProfile(data);
      });
    }
  }, [user]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập để đăng bài!");
      return;
    }
    if (!content.trim()) return;

    try {
      await createPost({
        authorId: user.id,
        authorName: profile?.name || user.user_metadata?.name || user.email?.split('@')[0],
        content,
        streak: profile?.currentStreak || 0,
        reputation: profile?.reputationScore || 100,
      });
      setContent("");
      toast.success("Đăng bài thành công!");
      loadPosts();
    } catch (error) {
      toast.error("Lỗi khi đăng bài");
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.info("Đăng nhập để thả tim nhé!");
      return;
    }
    
    // Optimistic UI update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
    
    try {
      await likePost(postId);
    } catch (error) {
      // Revert if error
      loadPosts();
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins || 1} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-teal-600">
        <Loader2 className="animate-spin" size={32} />
        <span className="ml-3 font-bold">Đang tải bảng tin cộng đồng...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Feed Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="bg-teal-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-20 w-48 h-48 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight uppercase">Cộng Đồng UEH</h1>
          <p className="text-teal-100 text-sm md:text-base font-medium">Khoe chuỗi tập luyện, chia sẻ khoảnh khắc đổ mồ hôi và truyền động lực cho nhau!</p>
        </div>
      </div>

      {/* Create Post Form */}
      <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm">
        <form onSubmit={handlePost}>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 uppercase border-2 border-white shadow-sm">
              {profile?.name?.[0] || user?.email?.[0] || "?"}
            </div>
            <div className="flex-1 space-y-3">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Hôm nay bạn đã đốt cháy bao nhiêu calo rồi?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 text-sm font-medium resize-none min-h-[80px] placeholder:text-slate-400"
              />
              
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                  <button type="button" className="text-slate-500 hover:text-teal-600 bg-slate-50 p-2 rounded-lg transition-colors" title="Thêm ảnh">
                    <ImageIcon size={20} />
                  </button>
                  <div className="flex items-center gap-1.5 text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 text-xs font-bold" title="Sẽ đính kèm Streak hiện tại của bạn">
                    <Flame size={16} /> Khoe Streak: {profile?.currentStreak || 0}
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={!content.trim() || !user}
                  className="bg-teal-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={16} /> Đăng bài
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Feed Stream */}
      <div className="space-y-5">
        {(!posts || posts.filter(Boolean).length === 0) ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border-2 border-slate-100">
            <MessageCircle size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="font-medium">Chưa có bài viết nào.</p>
            <p className="text-sm">Hãy là người đầu tiên chia sẻ khoảnh khắc tập luyện nhé!</p>
          </div>
        ) : posts.filter(Boolean).map((post, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={post.id || idx} 
            className="bg-white rounded-2xl border-2 border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Author Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center uppercase border-2 border-white shadow-sm">
                  {post.authorName?.[0] || "?"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    {post.authorName}
                    {post.reputation >= 150 && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 p-0.5 rounded flex items-center" title="Người dùng uy tín">
                        <Award size={12} />
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500">
                    {formatTime(post.createdAt)}
                  </p>
                </div>
              </div>
              
              {post.streak > 0 && (
                <div className="bg-orange-50 border border-orange-100 text-orange-600 px-2 py-1 rounded-md flex items-center gap-1">
                  <Flame size={14} className="fill-orange-100" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Streak: {post.streak}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap mb-4 font-medium">
              {post.content}
            </div>

            {/* Interaction Footer */}
            <div className="pt-3 border-t border-slate-100 flex gap-1">
              <button 
                onClick={() => handleLike(post.id)}
                className="flex-1 py-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 font-bold text-xs flex justify-center items-center gap-1.5 transition-colors"
              >
                <Heart size={18} className={post.likes > 0 ? "fill-rose-500 text-rose-500" : ""} /> 
                {post.likes > 0 ? post.likes : 'Thích'}
              </button>
              <button className="flex-1 py-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-teal-50 font-bold text-xs flex justify-center items-center gap-1.5 transition-colors">
                <MessageCircle size={18} /> Bình luận
              </button>
              <button className="flex-1 py-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-teal-50 font-bold text-xs flex justify-center items-center gap-1.5 transition-colors">
                <Share2 size={18} /> Chia sẻ
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      </div>

      {/* Right Sidebar - Stats & Suggestions */}
      <div className="hidden lg:block space-y-6">
        {user ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm sticky top-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto flex items-center justify-center font-bold text-xl text-teal-800 mb-2 border-2 border-white shadow-sm overflow-hidden">
                {user?.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover"/> : (profile?.name?.[0] || "?")}
              </div>
              <h3 className="font-bold text-slate-800">{profile?.name || user?.user_metadata?.name || "Người dùng"}</h3>
              <p className="text-xs text-slate-500">Mục tiêu: Đổ mồ hôi mỗi ngày</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-sm border-t border-slate-100 pt-4">
              <div>
                <p className="font-black text-slate-800 text-lg">{profile?.currentStreak || 0}</p>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Streak</p>
              </div>
              <div>
                <p className="font-black text-slate-800 text-lg">{profile?.reputationScore || 0}</p>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Uy tín</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-6 text-white shadow-sm sticky top-6">
            <h3 className="font-bold mb-2 text-lg">Chưa đăng nhập</h3>
            <p className="text-sm text-teal-100 mb-5 leading-relaxed font-medium">Đăng nhập để tương tác, khoe thành tích và chia sẻ với cộng đồng UEH.</p>
            <Link to="/auth" className="block text-center bg-white text-teal-700 font-bold py-3 rounded-xl text-sm shadow-sm hover:bg-teal-50 transition-colors">
              Đăng nhập ngay
            </Link>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm sticky top-[280px]">
          <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Flame size={18} className="text-orange-500" /> Xu hướng hôm nay
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5 pb-3 border-b border-slate-100">
              <span className="text-[10px] text-teal-600 font-black uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-full w-fit">Hashtag Nổi Bật</span>
              <p className="font-bold text-slate-800 text-sm hover:text-teal-600 cursor-pointer">#RunForHealth</p>
              <p className="text-[11px] text-slate-500 font-medium">2.4k bài viết</p>
            </div>
            <div className="flex flex-col gap-1.5 pb-3 border-b border-slate-100">
              <span className="text-[10px] text-orange-600 font-black uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-full w-fit">Môn thể thao hot</span>
              <p className="font-bold text-slate-800 text-sm hover:text-orange-600 cursor-pointer">Cầu lông UEH N</p>
              <p className="text-[11px] text-slate-500 font-medium">1.2k bài viết</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-blue-600 font-black uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full w-fit">Sự kiện</span>
              <p className="font-bold text-slate-800 text-sm hover:text-blue-600 cursor-pointer">Giải bóng rổ Khoa QTKD</p>
              <p className="text-[11px] text-slate-500 font-medium">500+ bàn luận</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}