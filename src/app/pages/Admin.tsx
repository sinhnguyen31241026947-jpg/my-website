import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Loader2, Flag, AlertCircle, Eye, Crown } from "lucide-react";
import { getPosts, getProfile, updateProfile, getReports, approvePost, rejectPost } from "../api";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type Post = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  status?: string;
  createdAt: string;
};

type Report = {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetName?: string;
  reason: string;
  matchId: string;
  createdAt: string;
  resolved?: boolean;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
};

export function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Check if user is admin - redirect if not
  useEffect(() => {
    if (!isAdmin) {
      toast.error("Bạn không có quyền truy cập trang này!");
      navigate("/");
    }
  }, [isAdmin, navigate]);

  const loadPosts = async () => {
    try {
      const data = await getPosts();
      const pending = (data || []).filter((p: any) => p.status === 'pending' || !p.status);
      setPosts(pending);
    } catch (err) {
      toast.error("Lỗi tải bài viết chờ duyệt");
    }
  };

  const loadReports = async () => {
    try {
      const data = await getReports();
      setReports(data || []);
    } catch (err) {
      toast.error("Lỗi tải báo cáo");
    }
  };

  const loadAdmins = async () => {
    try {
      // Giả sử lấy từ localStorage hoặc API backend
      const stored = localStorage.getItem('adminUsers');
      if (stored) {
        setAdminUsers(JSON.parse(stored));
      }
    } catch (err) {
      toast.error("Lỗi tải danh sách admin");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadPosts(), loadReports(), loadAdmins()]).finally(() => setIsLoading(false));
  }, []);

  const handleApprovePost = async (postId: string) => {
    try {
      await approvePost(postId);
      toast.success("Bài viết đã được duyệt!");
      setPosts(posts.filter(p => p.id !== postId));
      setSelectedPost(null);
    } catch (err) {
      toast.error("Lỗi duyệt bài viết");
    }
  };

  const handleRejectPost = async (postId: string) => {
    try {
      await rejectPost(postId);
      setPosts(posts.filter(p => p.id !== postId));
      setSelectedPost(null);
      toast.success("Bài viết đã bị từ chối");
    } catch (err) {
      toast.error("Lỗi từ chối bài viết");
    }
  };

  const handleResolveReport = async (report: Report) => {
    try {
      // Trừ điểm uy tín cho người bị báo cáo
      if (report.targetId) {
        const profile = await getProfile(report.targetId);
        if (profile) {
          await updateProfile(report.targetId, {
            reputationScore: Math.max(0, (profile.reputationScore || 100) - 20)
          });
        }
      }
      // Đánh dấu report là đã xử lý
      const updated = reports.map(r => r.id === report.id ? { ...r, resolved: true } : r);
      setReports(updated);
      setSelectedReport(null);
      toast.success("Báo cáo đã được xử lý!");
    } catch (err) {
      toast.error("Lỗi xử lý báo cáo");
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    try {
      const newAdmin: AdminUser = {
        id: crypto.randomUUID(),
        name: newAdminEmail.split('@')[0],
        email: newAdminEmail.trim(),
        isAdmin: true,
        createdAt: new Date().toISOString()
      };
      const updated = [...adminUsers, newAdmin];
      setAdminUsers(updated);
      localStorage.setItem('adminUsers', JSON.stringify(updated));
      setNewAdminEmail("");
      toast.success(`Đã thêm admin: ${newAdminEmail}`);
    } catch (err) {
      toast.error("Lỗi thêm admin");
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (adminId === user?.id) {
      toast.error("Không thể xóa admin hiện tại!");
      return;
    }
    try {
      const updated = adminUsers.filter(a => a.id !== adminId);
      setAdminUsers(updated);
      localStorage.setItem('adminUsers', JSON.stringify(updated));
      toast.success("Đã xóa admin!");
    } catch (err) {
      toast.error("Lỗi xóa admin");
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 text-slate-500">
        <AlertCircle size={48} className="mx-auto mb-4 text-slate-300" />
        <p>Bạn cần đăng nhập để truy cập trang quản trị</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-teal-600">
        <Loader2 className="animate-spin" size={32} />
        <span className="ml-3 font-bold">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-800 to-teal-600 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-black mb-2 uppercase">Bảng Điều Khiển Quản Trị</h1>
        <p className="text-teal-100">Duyệt bài viết, xử lý báo cáo và quản lý người dùng</p>
      </div>

      <div className="flex gap-6 border-b-2 border-slate-100 pb-2">
        {[
          { key: 'posts', label: 'Bài chờ duyệt', count: posts.length },
          { key: 'reports', label: 'Báo cáo', count: reports.filter(r => !r.resolved).length },
          { key: 'admins', label: 'Quản lý Admin', count: adminUsers.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 text-sm font-bold border-b-4 transition-colors flex items-center gap-2 ${
              activeTab === tab.key
                ? 'border-teal-800 text-teal-800'
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'posts' && (
        <AnimatePresence>
          {posts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Check size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="font-medium">Không có bài viết nào chờ duyệt</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {posts.map(post => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border-2 border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800">{post.authorName}</h3>
                      <p className="text-xs text-slate-500">
                        {new Date(post.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold">
                      {post.status === 'pending' ? 'Chờ duyệt' : 'Bị từ chối'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-4 line-clamp-3">{post.content}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprovePost(post.id)}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Check size={16} /> Duyệt bài
                    </button>
                    <button
                      onClick={() => handleRejectPost(post.id)}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <X size={16} /> Từ chối
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}

      {activeTab === 'reports' && (
        <AnimatePresence>
          {reports.filter(r => !r.resolved).length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Flag size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="font-medium">Không có báo cáo chưa xử lý</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports
                .filter(r => !r.resolved)
                .map(report => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border-2 border-red-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Flag size={16} className="text-red-600" />
                          Báo cáo từ {report.reporterName}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {new Date(report.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                        Chưa xử lý
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg mb-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 mb-1">LÝ DO:</p>
                      <p className="text-sm text-slate-700">{report.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolveReport(report)}
                        className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Check size={16} /> Xác nhận báo cáo
                      </button>
                      <button
                        onClick={() => setSelectedReport(null)}
                        className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-300 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Eye size={16} /> Chi tiết
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </AnimatePresence>
      )}

      {activeTab === 'admins' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-teal-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Crown size={20} className="text-yellow-600" />
              Thêm Admin Mới
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Email của admin mới..."
                className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 font-medium"
                onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
              />
              <button
                onClick={handleAddAdmin}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 flex items-center gap-2 transition-colors"
              >
                <Check size={16} /> Thêm
              </button>
            </div>
          </div>

          <AnimatePresence>
            {adminUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Crown size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="font-medium">Chưa có admin nào</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {adminUsers.map(admin => (
                  <motion.div
                    key={admin.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border-2 border-yellow-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Crown size={16} className="text-yellow-600" />
                          {admin.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{admin.email}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(admin.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      {admin.id !== user?.id ? (
                        <button
                          onClick={() => handleRemoveAdmin(admin.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 flex items-center gap-2 transition-colors"
                        >
                          <X size={16} /> Xóa
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg font-bold text-sm">
                          (Tài khoản hiện tại)
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
