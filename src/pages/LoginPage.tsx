import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as any)?.from?.pathname || "/admin";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-subtle flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputCls = "w-full border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-colors placeholder-text-muted";
  const labelCls = "block text-xs font-medium text-text-secondary mb-1.5";

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col">
      {/* Top bar matching site header */}
      <header className="bg-white border-b border-border h-14 flex items-center px-6 shadow-sm">
        <Link to="/" className="text-sm font-semibold text-text-primary tracking-tight">
          Vikramaditya Metrology
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-sm"
        >
          {/* Logo mark */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-brand-orange flex items-center justify-center text-white font-bold text-lg mb-4 shadow-sm">
              VM
            </div>
            <h1 className="text-xl font-semibold text-text-primary">Sign in</h1>
            <p className="text-xs text-text-secondary mt-1">
              Vikramaditya Metrology Center — Admin Portal
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="admin@vikramaditya.com"
                  required
                  autoComplete="email"
                  autoFocus
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
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5 flex items-start gap-2">
                  <span className="mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-orange text-white font-medium text-sm py-2.5 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={15} />
                )}
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-[11px] text-text-muted mt-6">
            ISO 17025 Accredited · Vikramaditya Metrology Center
          </p>
          <p className="text-center mt-2">
            <Link to="/" className="text-xs text-text-secondary hover:text-brand-orange transition-colors">
              ← Back to website
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
