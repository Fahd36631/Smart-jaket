import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      await login({ username, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول");
    }
  };

  return (
    <div className="page-enter flex min-h-screen bg-surface-muted">
      <div className="relative hidden flex-1 items-center justify-center bg-brand-dark/90 p-12 text-white lg:flex">
        <img
          src="/logoDfa3.png"
          alt="شعار الدفاع المدني"
          className="mb-8 h-24 w-24 rounded-full bg-white/90 p-2"
        />
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/80">
            الدفاع المدني
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-snug">
            منصة متابعة السترات الذكية
          </h1>
          <p className="mt-6 text-lg text-white/80">
            راقب صحة الأفراد والمواقع الميدانية بلحظات، وابقَ مستعداً للتعامل مع
            أي حالة طارئة.
          </p>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_45%)]" />
      </div>

      <div className="flex w-full max-w-xl flex-col justify-center bg-white px-8 py-12 shadow-2xl lg:px-16">
        <div className="mb-10">
          <div className="mb-6 flex flex-col items-center justify-center lg:hidden">
            <img
              src="/logoDfa3.png"
              alt="شعار الدفاع المدني"
              className="mb-4 h-20 w-20 rounded-full bg-white p-2 shadow-md"
            />
            <p className="text-xs uppercase tracking-wider text-gray-400">
              الدفاع المدني
            </p>
            <h1 className="mt-2 text-center text-xl font-bold text-brand-dark">
              منصة متابعة السترات الذكية
            </h1>
            <p className="mt-3 text-center text-sm text-gray-600">
              راقب صحة الأفراد والمواقع الميدانية بلحظات، وابقَ مستعداً للتعامل مع
              أي حالة طارئة.
            </p>
          </div>
          <p className="text-sm text-gray-500">مرحباً بعودتك</p>
          <h2 className="text-3xl font-bold text-brand-dark">تسجيل دخول الضابط</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              البريد الوظيفي / اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-surface-muted px-4 py-3 text-base focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light/50"
              placeholder="officer@998.gov.sa"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-surface-muted px-4 py-3 text-base focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-2xl bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-brand-dark py-3 text-lg font-semibold text-white transition hover:bg-brand-dark/90 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "جاري التحقق..." : "الدخول"}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-500">
          جميع الحقوق محفوظة © المديرية العامة للدفاع المدني 2025
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

