// Responsive, clean, modernized login/signup screen with soft dark glassy/neuromorphic look
// Includes email confirmation resend functionality
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, LogIn, User, RefreshCw, CheckCircle } from "lucide-react";
import useAuth from "@/contexts/authHooks";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { resendConfirmationEmail } from "@/utils/authUtils";

const glassClass =
  "backdrop-blur-lg bg-white/10 dark:bg-zinc-900/50 rounded-2xl shadow-2xl border border-white/10 dark:border-zinc-700/30";

const OnboardingAuth: React.FC = () => {
  const { signIn, signUp, isLoading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [formVals, setFormVals] = useState({ email: "", password: "" });
  const [showResendOption, setShowResendOption] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormVals({ ...formVals, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (tab === "signin") {
        await signIn(formVals.email, formVals.password);
        toast.success("Welcome back!");
        navigate("/");
      } else {
        await signUp(formVals.email, formVals.password);
        toast.success("Account created! Please check your email to confirm.");
        setResendEmail(formVals.email);
        setShowResendOption(true);
        setTab("signin");
        setFormVals({ email: "", password: "" });
      }
    } catch (err: any) {
      // Check if it's an email confirmation issue
      const errorMsg = err?.message?.toLowerCase() || '';
      if (errorMsg.includes('email not confirmed') || errorMsg.includes('confirm')) {
        setResendEmail(formVals.email);
        setShowResendOption(true);
        toast.error("Please confirm your email first. Check your inbox or click resend below.");
      }
      // Other errors handled in hook
    }
  };

  const handleResendConfirmation = async () => {
    if (!resendEmail) {
      toast.error("Please enter your email first");
      return;
    }

    setIsResending(true);
    try {
      const success = await resendConfirmationEmail(resendEmail);
      if (success) {
        toast.success("Confirmation email sent! Please check your inbox.");
      } else {
        toast.error("Failed to resend. Please try again.");
      }
    } catch {
      toast.error("Failed to resend confirmation email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative py-8">
      {/* Ambient glow effects matching brand */}
      <div className="absolute top-[-80px] left-[-80px] w-[220px] h-[220px] bg-gradient-to-tr from-primary/40 via-primary/20 to-transparent rounded-full blur-3xl opacity-30 z-0" />
      <div className="absolute bottom-[-60px] right-[-60px] w-[180px] h-[180px] bg-primary/20 rounded-full blur-2xl opacity-25 z-0" />
      <div className="absolute left-1/2 top-1/3 w-[130px] h-[80px] rounded-[2.5rem] bg-muted/10 opacity-15 blur-2xl z-0 -translate-x-[70%]" />
      
      <div className={`relative z-10 w-[95vw] max-w-sm mx-auto px-2 py-8 sm:py-10 backdrop-blur-lg bg-card/80 rounded-2xl shadow-2xl border border-border`}>
        {/* App Branding */}
        <div className="flex flex-col items-center gap-0 mb-6">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent drop-shadow-sm">CinemaxStream</span>
          <span className="text-base text-center text-muted-foreground font-medium select-none mb-1">
            {tab === "signin"
              ? "Welcome back! Sign in to watch and stream your favorite content."
              : "Create a free account in seconds to unlock all features."}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="w-full flex items-center justify-center mb-6">
          <button
            className={`flex-1 px-5 py-2 text-sm font-semibold rounded-l-xl focus:outline-none transition-all ${tab === "signin" ? "bg-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground border-r border-border"}`}
            onClick={() => { setTab("signin"); setShowResendOption(false); }}
            disabled={isLoading}
          >
            <LogIn className="inline-block mr-1 -mt-1 h-4 w-4" /> Sign In
          </button>
          <button
            className={`flex-1 px-5 py-2 text-sm font-semibold rounded-r-xl focus:outline-none transition-all ${tab === "signup" ? "bg-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground border-l border-border"}`}
            onClick={() => { setTab("signup"); setShowResendOption(false); }}
            disabled={isLoading}
          >
            <User className="inline-block mr-1 -mt-1 h-4 w-4" /> Sign Up
          </button>
        </div>

        {/* Email Confirmation Resend Notice */}
        {showResendOption && tab === "signin" && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-200 mb-2">
                  Haven't received your confirmation email?
                </p>
                <div className="flex flex-col gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="h-9 text-sm bg-white/10 border-amber-500/30 text-white"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleResendConfirmation}
                    disabled={isResending || !resendEmail}
                    className="bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    {isResending ? (
                      <><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Sending...</>
                    ) : (
                      <><RefreshCw className="h-3 w-3 mr-1" /> Resend Confirmation Email</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} autoComplete="on">
          <div>
            <label htmlFor="email-auth" className="block text-left mb-1 font-medium text-foreground/70">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="email-auth"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="Your email"
                value={formVals.email}
                onChange={handleChange}
                className="pl-10 bg-muted/50 border-border text-foreground"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password-auth" className="block text-left mb-1 font-medium text-foreground/70">
                Password
              </label>
              {tab === "signin" && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground transition"
                  onClick={() => navigate('/reset-password')}
                  tabIndex={0}
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="password-auth"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
                placeholder={tab === "signin" ? "Your password" : "Create a password"}
                value={formVals.password}
                onChange={handleChange}
                className="pl-10 bg-muted/50 border-border text-foreground"
                required
                minLength={6}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{tab === "signup" ? "Password must be at least 6 characters" : null}</p>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-lg"
            size="lg"
            disabled={isLoading}
          >
            {tab === "signin" ? "Sign In" : "Create Account"}
          </Button>
          <div className="flex justify-center pt-1">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => { setTab(tab === "signin" ? "signup" : "signin"); setShowResendOption(false); }}
              tabIndex={-1}
            >
              {tab === "signin"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>

        {/* Resend link for existing users */}
        {!showResendOption && tab === "signin" && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowResendOption(true)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Need to resend confirmation email?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingAuth;
