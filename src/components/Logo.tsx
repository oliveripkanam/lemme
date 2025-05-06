"use client";

import { motion } from "framer-motion";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  isDark?: boolean;
};

const Logo = ({ size = "md", isDark = false }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-24",
  };

  const textColor = isDark ? "text-white" : "text-primary";

  return (
    <motion.div 
      className={`flex flex-col items-center ${sizeClasses[size]}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <span className={`text-xs tracking-widest uppercase ${textColor}`}>Japanese</span>
        <div className="relative inline-block">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M14 24C15.5 24 18 23.5 19 22C20 20.5 20.5 19 20.5 17.5C20.5 16 19.5 14.5 18 14C16.5 13.5 15 14 14 15C13 16 12.5 17 12.5 18.5C12.5 20 13.5 21.5 14 22C14.5 22.5 15.5 23 16.5 23" 
                stroke="#F5F2EA" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <path 
                d="M22 11C22 15 18 17 14 17" 
                stroke="#F5F2EA" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <path 
                d="M18 6C18 4.5 16 3 14 4C12 5 11 7 10 8C9 9 8 10 8 11C8 12 9 13 10 13C11 13 12 12 13 10C14 8 14.5 7 15 6" 
                stroke="#F5F2EA" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="absolute -bottom-2 -right-1 w-6 h-6 bg-primary rounded-full" />
        </div>
        <span className={`text-xs tracking-widest uppercase ${textColor}`}>Inspired</span>
      </div>
      <h1 className={`font-bold text-3xl ${textColor} mt-1`}>LEMME</h1>
      <span className={`text-xs tracking-widest uppercase ${textColor} mt-1`}>One Day Cafe</span>
    </motion.div>
  );
};

export default Logo; 