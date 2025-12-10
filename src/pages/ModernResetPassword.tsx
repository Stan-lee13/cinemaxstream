
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/utils/errorHelpers";

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
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Could not send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-zinc-950 via-cinemax-900 to-zinc-800 relative p-4 sm:p-6 md:p-8">
      {/* Background decorative elements */}
      <div className="absolute top-[-80px] left-[-80px] w-[220px] h-[220px] bg-gradient-to-tr from-cinemax-400 via-cinemax-700/60 to-transparent rounded-full blur-3xl opacity-30 z-0" />
      <div className="absolute bottom-[-60px] right-[-60px] w-[180px] h-[180px] bg-cinemax-700/40 rounded-full blur-2xl opacity-25 z-0" />

      <div className="relative z-10 w-full max-w-sm mx-auto backdrop-blur-lg bg-white/10 dark:bg-zinc-900/50 rounded-2xl shadow-2xl border border-white/10 dark:border-zinc-700/30 p-6">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Reset Your Password</h2>
          <p className="text-sm sm:text-base text-cinemax-200/90 leading-relaxed">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {isSent ? (
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="space-y-3">
              <div className="text-green-400 text-lg sm:text-xl">✅ Reset email sent!</div>
              <div className="text-sm sm:text-base text-gray-300 leading-relaxed px-2">
                Check your inbox and follow the link to create a new password.
              </div>
            </div>
            <Button variant="outline" className="w-full h-11 sm:h-12 text-sm sm:text-base" onClick={() => navigate("/auth")}>Return to Login</Button>
          </div>
        ) : (
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="reset-email" className="block text-sm sm:text-base font-medium text-cinemax-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cinemax-400 h-4 w-4 sm:h-5 sm:w-5" />
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="username"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 sm:h-12 pl-10 sm:pl-12 pr-4 text-sm sm:text-base bg-white/80 dark:bg-zinc-900/40 border-none text-white placeholder:text-gray-400"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Button
                type="submit"
                className="w-full h-11 sm:h-12 bg-cinemax-500 hover:bg-cinemax-600 transition-all shadow-lg text-sm sm:text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-current border-t-transparent rounded-full inline-block" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <Button type="button" variant="ghost" className="w-full h-10 sm:h-11 text-cinemax-400 hover:text-cinemax-300 text-sm sm:text-base" onClick={() => navigate("/auth")}>Back to Login</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModernResetPassword;
