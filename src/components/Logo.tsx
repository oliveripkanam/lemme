"use client";

import React from "react";
import { motion } from "framer-motion";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  isDark?: boolean;
};

const Logo = ({ size = "md", isDark = false }: LogoProps) => {
  // Text size classes based on the size prop
  const textSizeClasses = {
    sm: "text-md",
    md: "text-xl",
    lg: "text-3xl",
  };

  const textColor = isDark ? "text-white" : "text-primary";

  return (
    <motion.div 
      className="flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className={`${textSizeClasses[size]} tracking-widest uppercase ${textColor} font-semibold whitespace-nowrap`}>
        LEMME ONE DAY CAFE
      </span>
    </motion.div>
  );
};

export default Logo; 