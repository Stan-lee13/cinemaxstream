
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ModernResetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-update`,
      });
      if (error) throw error;
      setIsSent(true);
      toast.success("Password reset link sent! Please check your email.");
    } catch (error: any) {
      toast.error(error?.message || "Could not send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-zinc-950 via-cinemax-900 to-zinc-800 relative py-8">
      <div className="absolute top-[-80px] left-[-80px] w-[220px] h-[220px] bg-gradient-to-tr from-cinemax-400 via-cinemax-700/60 to-transparent rounded-full blur-3xl opacity-30 z-0" />
      <div className="absolute bottom-[-60px] right-[-60px] w-[180px] h-[180px] bg-cinemax-700/40 rounded-full blur-2xl opacity-25 z-0" />
      <div className="relative z-10 w-[95vw] max-w-sm mx-auto px-2 py-8 sm:py-10 backdrop-blur-lg bg-white/10 dark:bg-zinc-900/50 rounded-2xl shadow-2xl border border-white/10 dark:border-zinc-700/30">
        <h2 className="text-2xl font-bold mb-4 text-center text-white">Reset Your Password</h2>
        <p className="text-center text-cinemax-200/90 mb-5">
          Enter your email and we’ll send you a reset link.
        </p>
        {isSent ? (
          <div className="text-center text-green-400 space-y-5">
            <div>
              <span className="block mb-2">✅ Reset email sent!</span>
              <span className="text-sm text-gray-300">
                Check your inbox and follow the link to create a new password.
              </span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
              Return to Login
            </Button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="reset-email" className="block mb-1 font-medium text-cinemax-400">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cinemax-400 h-4 w-4" />
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="username"
                  placeholder="Your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-white/80 dark:bg-zinc-900/40 border-none text-white"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-cinemax-500 hover:bg-cinemax-600 transition-all shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full inline-block" />
              ) : (
                "Send Reset Link"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-cinemax-400"
              onClick={() => navigate("/auth")}
            >
              Back to Login
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModernResetPassword;
