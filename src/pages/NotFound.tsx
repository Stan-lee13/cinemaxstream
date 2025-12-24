import React, { useEffect } from 'react';
import { useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, Compass } from "lucide-react";
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const NotFound = () => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Silently handle 404 errors in production
    console.log("404 Error: Page not found - ", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[30%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[120px]" />
        </div>

        <motion.div
          className="text-center relative z-10 px-4 not-found-content"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative inline-block">
            <h1 className="text-[150px] md:text-[250px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 glitch-text"
                animate={prefersReducedMotion ? undefined : { x: [0, 2, -2, 2, 0] }}
                transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 5, ease: 'linear' }}
              >
                Lost in Space?
              </motion.span>
            </div>
          </div>

          <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto mb-10 mt-[-20px]">
            The page you are looking for seems to have drifted away into the digital void.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button className="h-12 px-8 rounded-xl bg-white text-black hover:bg-gray-200 font-bold text-base transition-transform hover:scale-105">
                <Home className="w-5 h-5 mr-2" />
                Return Home
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" className="h-12 px-8 rounded-xl border-white/10 hover:bg-white/10 text-white font-medium">
                <Compass className="w-5 h-5 mr-2" />
                Discover Content
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
