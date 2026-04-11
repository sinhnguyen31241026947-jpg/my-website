import { useState } from 'react';
import { supabase } from './AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';

export function Auth({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Nam');
  const [dob, setDob] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [faculty, setFaculty] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [level, setLevel] = useState('Người mới (Beginner)');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const sportOptions = ['Bóng rổ', 'Bơi lội', 'Bóng bàn', 'Cầu lông', 'Chạy bộ', 'Tennis', 'Gym', 'Bóng đá'];
  
  const isAdminEmail = (emailToCheck: string) => {
    // Hardcode admin emails hoặc check trong localStorage
    const ADMIN_EMAILS = ['admin@uehflex.fit', 'sinhnguyen.31241026947@st.ueh.edu.vn'];
    return ADMIN_EMAILS.includes(emailToCheck);
  };

  const setAdminStatus = async (userId: string, email: string, isAdmin: boolean) => {
    try {
      await supabase.auth.admin?.updateUserById(userId, {
        user_metadata: { isAdmin }
      });
    } catch (err) {
      console.error('Error setting admin status:', err);
    }
  };
  
  const toggleInterest = (sport: string) => {
    setInterests(prev => prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error('Đăng nhập thất bại: ' + error.message);
      } else {
        // Cập nhật isAdmin status
        if (data.user) {
          const shouldBeAdmin = isAdminEmail(email);
          await setAdminStatus(data.user.id, email, shouldBeAdmin);
        }
        toast.success('Đăng nhập thành công!');
        onAuthSuccess?.();
      }
    } else {
      try {
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-eeef72dc/signup`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password, name, gender, dob, weight, height, faculty, interests, level, bio }),
        });
        const data = await res.json();
        
        if (res.ok) {
          toast.success('Đăng ký thành công! Đang tự động đăng nhập...');
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (!signInError && signInData?.user) {
            // Cập nhật isAdmin status sau signup
            const shouldBeAdmin = isAdminEmail(email);
            await setAdminStatus(signInData.user.id, email, shouldBeAdmin);
            onAuthSuccess?.();
          }
        } else {
          if (data.error?.includes('already been registered') || data.error?.includes('already registered')) {
            toast.error('Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.');
          } else {
            toast.error('Đăng ký thất bại: ' + (data.error || 'Lỗi không xác định'));
          }
        }
      } catch (err: any) {
        toast.error('Lỗi kết nối máy chủ: ' + err.message);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-teal-100">
      <div className="text-center mb-6">
        <div className="mx-auto bg-orange-500 text-white p-3 rounded-xl w-14 h-14 flex items-center justify-center mb-3">
          <Dumbbell size={32} />
        </div>
        <h2 className="text-2xl font-bold text-teal-800">
          {isLogin ? 'Đăng nhập UEH Flex-Fit Connect' : 'Đăng ký Tài khoản'}
        </h2>
        <p className="text-gray-500 mt-2">
          {isLogin ? 'Chào mừng bạn quay trở lại!' : 'Tham gia cộng đồng thể thao UEH ngay.'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                placeholder="Ví dụ: Nguyễn Văn A"
                required={!isLogin}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                  <option>Nam</option>
                  <option>Nữ</option>
                  <option>Khác</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" required={!isLogin} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cân nặng (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="60" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Chiều cao (cm)</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khoa (Phòng ban)</label>
              <input type="text" value={faculty} onChange={(e) => setFaculty(e.target.value)} placeholder="VD: Khoa Công nghệ Thông tin Kinh doanh" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Môn thể thao yêu thích</label>
              <div className="flex flex-wrap gap-2">
                {sportOptions.map(s => (
                  <button type="button" key={s} onClick={() => toggleInterest(s)} className={`px-3 py-1.5 text-xs rounded-full border transition-all ${interests.includes(s) ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 font-medium' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                <option>Người mới (Beginner)</option>
                <option>Trung bình (Intermediate)</option>
                <option>Chuyên nghiệp (Advanced)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="Hãy viết vài dòng về bạn..."></textarea>
            </div>
          </>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email sinh viên (hoặc email cá nhân)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            placeholder="example@st.ueh.edu.vn"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang xử lý...' : isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">
          {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
        </span>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-teal-600 font-semibold hover:underline"
        >
          {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
        </button>
      </div>
    </div>
  );
}
