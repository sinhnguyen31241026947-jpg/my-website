import { useState, useEffect } from "react";
import {
  User,
  Award,
  Flame,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { useAuth } from "../components/AuthContext";
import { getProfile, createProfile } from "../api";

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getProfile(user.id).then(async (data) => {
        if (!data) {
          // Khởi tạo profile mặc định
          const newProfile = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name,
            reputationScore: 100, // Điểm uy tín tân binh
            currentStreak: 0,
            badges: ["newbie"],
          };
          await createProfile(newProfile);
          setProfile(newProfile);
        } else {
          setProfile(data);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20 text-slate-500">
        <User
          size={48}
          className="mx-auto mb-4 text-slate-300"
        />
        <p>Vui lòng đăng nhập để xem hồ sơ</p>
      </div>
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="text-center py-20">Đang tải hồ sơ...</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-teal-800 to-teal-600"></div>
        <div className="relative pt-16 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl font-black text-teal-800 mb-4 z-10 relative -mt-12 overflow-hidden">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                className="w-full h-full object-cover"
                alt="avatar"
              />
            ) : (
              profile.name?.[0] || "?"
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-1">
            {profile.name}
          </h1>
          <p className="text-slate-500 text-sm font-medium mb-4">
            {profile.email}
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-6 px-4">
            {user.user_metadata?.faculty && (
              <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold border border-teal-100">
                {user.user_metadata.faculty}
              </span>
            )}
            {user.user_metadata?.gender && (
              <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold border border-teal-100">
                {user.user_metadata.gender}
              </span>
            )}
            {user.user_metadata?.dob && (
              <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold border border-teal-100">
                {user.user_metadata.dob}
              </span>
            )}
            {user.user_metadata?.weight && (
              <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold border border-teal-100">
                {user.user_metadata.weight} kg
              </span>
            )}
            {user.user_metadata?.height && (
              <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold border border-teal-100">
                {user.user_metadata.height} cm
              </span>
            )}
            {user.user_metadata?.level && (
              <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold border border-orange-100">
                {user.user_metadata.level}
              </span>
            )}
          </div>

          {user.user_metadata?.bio && (
            <p className="text-sm text-slate-600 text-center max-w-md px-6 mb-6 italic">
              "{user.user_metadata.bio}"
            </p>
          )}

          {user.user_metadata?.interests &&
            user.user_metadata.interests.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6 px-4 max-w-md">
                {user.user_metadata.interests.map(
                  (sport: string) => (
                    <span
                      key={sport}
                      className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-medium border border-slate-200"
                    >
                      {sport}
                    </span>
                  ),
                )}
              </div>
            )}

          <div className="grid grid-cols-2 gap-4 w-full max-w-md pb-8 px-4">
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
              <div className="mx-auto bg-orange-100 text-orange-500 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                <Flame size={20} strokeWidth={2.5} />
              </div>
              <p className="text-sm font-bold text-slate-700">
                Chuỗi Streak
              </p>
              <p className="text-xl font-black text-orange-600">
                {profile.currentStreak} ngày
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
              <div className="mx-auto bg-emerald-100 text-emerald-600 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                <ShieldCheck size={20} strokeWidth={2.5} />
              </div>
              <p className="text-sm font-bold text-slate-700">
                Điểm Uy Tín
              </p>
              <p className="text-xl font-black text-emerald-700">
                {profile.reputationScore}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-teal-900 mb-4 flex items-center gap-2">
          <Award className="text-orange-500" /> Tủ Huy Hiệu Của
          Bạn
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border-2 border-teal-100 bg-teal-50 rounded-xl p-4 text-center">
            <div className="mx-auto bg-white shadow-sm w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <Activity size={24} className="text-teal-600" />
            </div>
            <p className="text-xs font-bold text-teal-800">
              Tân Binh UEH
            </p>
          </div>
          {profile.reputationScore >= 150 && (
            <div className="border-2 border-amber-100 bg-amber-50 rounded-xl p-4 text-center">
              <div className="mx-auto bg-white shadow-sm w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <ShieldCheck
                  size={24}
                  className="text-amber-500"
                />
              </div>
              <p className="text-xs font-bold text-amber-700">
                Đáng Tin Cậy
              </p>
            </div>
          )}
          {profile.currentStreak >= 7 && (
            <div className="border-2 border-orange-100 bg-orange-50 rounded-xl p-4 text-center">
              <div className="mx-auto bg-white shadow-sm w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Flame size={24} className="text-orange-500" />
              </div>
              <p className="text-xs font-bold text-orange-700">
                Chuỗi 7 Ngày
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}