
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuthState";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const glassClass =
  "backdrop-blur-xl bg-white/20 dark:bg-zinc-700/40 rounded-3xl shadow-[0_6px_32px_0_rgba(31,38,135,0.15)] border border-white/30 dark:border-zinc-500/30";

const OnboardingAuth: React.FC = () => {
  const { signIn, signUp, isLoading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [signinVals, setSigninVals] = useState({ email: "", password: "" });
  const [signupVals, setSignupVals] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChangeSignIn = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSigninVals({ ...signinVals, [e.target.name]: e.target.value });
  };
  const handleChangeSignUp = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupVals({ ...signupVals, [e.target.name]: e.target.value });
  };

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signIn(signinVals.email, signinVals.password);
      toast.success("Welcome back!");
    } catch (err) {
      // error toast in hook
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signUp(signupVals.email, signupVals.password);
      toast.success("Account created! Please check your email.");
      setTab("signin");
    } catch (err) {
      // error toast in hook
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-cinemax-900 via-cinemax-600 to-cinemax-400 relative overflow-hidden">
      {/* 3D Animated Balls */}
      <motion.div 
        className="absolute top-[-120px] left-[-120px] z-0"
        initial={{ scale: 0.9, filter: "blur(0px)" }}
        animate={{ 
          scale: [0.9, 1.15, 1.05], 
          filter: [
            "blur(0px)", 
            "blur(8px)", 
            "blur(4px)",
            "blur(0px)" 
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
      >
        <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cinemax-400 via-cinemax-200 to-white/50 opacity-50 shadow-2xl" />
      </motion.div>
      <motion.div 
        className="absolute bottom-[-100px] right-[-130px] z-0"
        initial={{ scale: 0.85, filter: "blur(0px)" }}
        animate={{ 
          scale: [0.85, 1.07, 1.03], 
          filter: [
            "blur(0px)",
            "blur(3px)",
            "blur(10px)",
            "blur(0px)"
          ]
        }}
        transition={{ duration: 9, repeat: Infinity, repeatType: "reverse" }}
      >
        <div className="w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-cinemax-600 via-cinemax-400 to-white/20 opacity-40 shadow-2xl" />
      </motion.div>
      <motion.div
        className="absolute left-1/2 top-[30%] z-0"
        style={{ transform: "translate(-60%, -25%)" }}
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, 8, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, repeatType: "reverse" }}
      >
        <div className="w-[220px] h-[180px] rounded-[3.5rem] bg-white/20 dark:bg-cinemax-700/30 opacity-20 shadow-xl backdrop-blur-2xl border border-white/10" />
      </motion.div>

      {/* Auth Card */}
      <motion.div
        className={`relative z-10 w-full max-w-md mx-auto px-2 ${glassClass}`}
        initial={{ 
          y: 50, 
          scale: 0.9, 
          opacity: 0.7, 
          filter: "drop-shadow(0_3px_12px_rgba(100,100,255,0.1))" 
        }}
        animate={{ 
          y: 0, 
          scale: 1, 
          opacity: 1, 
          filter: "drop-shadow(0_8px_32px_rgba(120,0,80,0.18))"
        }}
        transition={{ duration: 1 }}
      >
        <div className="flex flex-col items-center gap-1 py-8">
          <motion.span
            className="text-5xl mb-2 font-black bg-gradient-to-r from-cinemax-400 via-cinemax-600 to-cinemax-900 bg-clip-text text-transparent drop-shadow-lg"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          >CinemaxStream</motion.span>
          <span className="text-base text-center text-gray-400 mb-1 font-medium select-none">
            {tab === "signin"
              ? "Sign in to unlock the full streaming experience."
              : "Create your account & start streaming instantly."}
          </span>
        </div>
        <Tabs
          defaultValue="signin"
          value={tab}
          onValueChange={(v) => setTab(v as "signin" | "signup")}
        >
          <TabsList className={`${glassClass} grid grid-cols-2 w-full mb-7`}>
            <TabsTrigger value="signin" className="flex gap-2 items-center">
              <LogIn className="w-4 h-4" /> Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex gap-2 items-center">
              <UserPlus className="w-4 h-4" /> Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignin} className="space-y-5">
              <div>
                <label htmlFor="email-signin" className="block text-left mb-1 font-medium text-cinemax-600">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cinemax-400 h-4 w-4" />
                  <Input
                    id="email-signin"
                    name="email"
                    autoComplete="username"
                    type="email"
                    placeholder="Enter your email"
                    value={signinVals.email}
                    onChange={handleChangeSignIn}
                    className="pl-10 bg-white/90 dark:bg-cinemax-950/60 border-none"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password-signin" className="block text-left mb-1 font-medium text-cinemax-600">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cinemax-400 h-4 w-4" />
                  <Input
                    id="password-signin"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={signinVals.password}
                    onChange={handleChangeSignIn}
                    className="pl-10 bg-white/90 dark:bg-cinemax-950/60 border-none"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cinemax-400"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-cinemax-500 hover:bg-cinemax-600 shadow-xl"
                size="lg"
                disabled={isLoading}
              >
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label htmlFor="email-signup" className="block text-left mb-1 font-medium text-cinemax-600">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cinemax-400 h-4 w-4" />
                  <Input
                    id="email-signup"
                    name="email"
                    autoComplete="username"
                    type="email"
                    placeholder="Enter your email"
                    value={signupVals.email}
                    onChange={handleChangeSignUp}
                    className="pl-10 bg-white/90 dark:bg-cinemax-950/60 border-none"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password-signup" className="block text-left mb-1 font-medium text-cinemax-600">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cinemax-400 h-4 w-4" />
                  <Input
                    id="password-signup"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a secure password"
                    value={signupVals.password}
                    onChange={handleChangeSignUp}
                    className="pl-10 bg-white/90 dark:bg-cinemax-950/60 border-none"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cinemax-400"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-cinemax-400 mt-1">Password must be at least 6 characters</p>
              </div>
              <Button
                type="submit"
                className="w-full bg-cinemax-500 hover:bg-cinemax-600 shadow-xl"
                size="lg"
                disabled={isLoading}
              >
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default OnboardingAuth;
