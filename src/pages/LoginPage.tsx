import { useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, LogIn, ChevronDown } from "lucide-react";
import { useAuth, Role } from "../context/AuthContext";

const DEMO_ACCOUNTS = [
  { email: "admin@vikramaditya.com",   role: "admin"   as Role, label: "Admin — Kiran Patil",   desc: "Full access to all modules" },
  { email: "manager@vikramaditya.com", role: "manager" as Role, label: "Manager — Rahul Desai", desc: "Operations & approvals" },
  { email: "staff@vikramaditya.com",   role: "staff"   as Role, label: "Staff — Priya Jadhav",  desc: "Day-to-day transactions" },
];

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/admin";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState<Role>("staff");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Already logged in → redirect
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  const fillDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword("demo1234");
    setRole(account.role);
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, role);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const labelCls = "block text-xs font-medium text-text-secondary mb-1.5";

  return (
    <div className="min-h-screen bg-surface-subtle flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-orange text-white font-bold text-lg mb-3">
            VM
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Vikramaditya Metrology</h1>
          <p className="text-xs text-text-secondary mt-1">Sign in to your account</p>
        </div>

        {/* Demo accounts */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-blue-700 mb-3">Demo Accounts — click to fill</p>
          <div className="flex flex-col gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillDemo(acc)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-colors ${
                  email === acc.email
                    ? "bg-blue-100 border-blue-400"
                    : "bg-white border-blue-200 hover:bg-blue-50"
                }`}
              >
                <div>
                  <div className="text-xs font-medium text-text-primary">{acc.label}</div>
                  <div className="text-[11px] text-text-secondary">{acc.desc}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  acc.role === "admin"   ? "bg-red-100 text-red-700" :
                  acc.role === "manager" ? "bg-amber-100 text-amber-700" :
                                          "bg-green-100 text-green-700"
                }`}>
                  {acc.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputCls}
                placeholder="you@vikramaditya.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${inputCls} pr-10`}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>Sign in as</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className={`${inputCls} appearance-none pr-8`}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange text-white font-medium text-sm py-2.5 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn size={15} />
              )}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-text-muted mt-6">
          Vikramaditya Metrology Center · ISO 17025 Accredited
        </p>
      </motion.div>
    </div>
  );
}
