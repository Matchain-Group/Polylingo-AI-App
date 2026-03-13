import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff, Globe2, AlertCircle } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LoginProps {
  onGoRegister: () => void;
  onLoginSuccess: () => void;
}

export function Login({ onGoRegister, onLoginSuccess }: LoginProps) {
  const { login, verifyOtp } = useAuthContext();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email || !password) { setErr("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.devOtp) setDevOtp(res.devOtp);
      toast.success("Verification code sent!");
      setStep("otp");
    } catch (e: unknown) {
      setErr((e as Error).message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!otp.trim()) { setErr("Enter your verification code"); return; }
    setLoading(true);
    try {
      await verifyOtp(email, otp.trim());
      toast.success("Welcome back!");
      onLoginSuccess();
    } catch (e: unknown) {
      setErr((e as Error).message ?? "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Globe2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Polylingo AI</h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <div className="glass-panel rounded-2xl p-8">
          {step === "credentials" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="auth-input w-full"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input w-full pr-12"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {err && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{err}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="auth-btn w-full flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-5 h-5" />}
                {loading ? "Sending code..." : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              {devOtp && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <p className="text-xs text-primary/70 font-medium uppercase tracking-wide mb-1">Dev Mode – Your Code</p>
                  <p className="text-3xl font-display font-bold text-primary tracking-widest">{devOtp}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                A 6-digit code was sent to <span className="font-medium text-foreground">{email}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Verification code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="auth-input w-full text-center text-2xl tracking-widest font-display"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>

              {err && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{err}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep("credentials"); setErr(""); setOtp(""); }} className="flex-1 auth-btn-ghost">
                  Back
                </button>
                <button type="submit" disabled={loading || otp.length !== 6} className="flex-1 auth-btn flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-foreground/10 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button onClick={onGoRegister} className="text-primary hover:underline font-medium">Create one</button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
