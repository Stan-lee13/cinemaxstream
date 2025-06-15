
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PasswordUpdate: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) {
      toast.error("Please enter and confirm your new password.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      // Supabase uses updateUser for this token-based flow
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setIsReset(true);
      toast.success("Password updated! Please log in with your new password.");
      setTimeout(() => {
        navigate("/auth");
      }, 1800);
    } catch (err: any) {
      toast.error(err.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card shadow-lg rounded-xl p-8 mx-2 text-center">
          <p className="text-lg font-bold mb-3">Your password was successfully updated.</p>
          <p className="mb-3">Redirecting you to login...</p>
          <Button onClick={() => navigate("/auth")}>Return to login now</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form className="bg-card shadow-lg rounded-xl p-8 mx-2 w-full max-w-md" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-4 text-center">Set New Password</h1>
        <div className="mb-4">
          <label htmlFor="password-new" className="block mb-1 text-sm font-medium">New Password</label>
          <Input
            id="password-new"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            autoComplete="new-password"
            disabled={isLoading}
            required
            className="bg-white/80 dark:bg-zinc-900/40"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password-confirm" className="block mb-1 text-sm font-medium">Confirm New Password</label>
          <Input
            id="password-confirm"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            minLength={6}
            autoComplete="new-password"
            disabled={isLoading}
            required
            className="bg-white/80 dark:bg-zinc-900/40"
          />
        </div>
        <Button type="submit" className="w-full bg-cinemax-500 hover:bg-cinemax-600" disabled={isLoading}>
          {isLoading ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full inline-block" /> : "Update Password"}
        </Button>
      </form>
    </div>
  );
};

export default PasswordUpdate;
