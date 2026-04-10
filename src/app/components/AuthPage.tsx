import { useNavigate } from "react-router";
import { Auth } from "./Auth";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";

export function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <Auth onAuthSuccess={() => navigate("/")} />
    </div>
  );
}
