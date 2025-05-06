"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Logo from "./Logo";

const Navbar = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navLinks = [
    { name: "About", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Pre-order", href: "/preorder" },
    { name: "FAQ", href: "/faq" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); 

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-primary/80 backdrop-filter backdrop-blur-lg shadow-lg border-b border-black/20" 
          : "bg-transparent border-b border-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center focus:outline-none">
              <Logo size="sm" isDark={true} />
            </Link>
          </div>
          <nav className="flex items-center space-x-1 md:space-x-8">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) + 0.2}}
              >
                <Link
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none ${
                    pathname !== link.href ?
                      `focus:ring-1 focus:ring-beige-light focus:ring-offset-1 ${isScrolled ? "focus:ring-offset-[#2C5B43]" : "focus:ring-offset-transparent"}` 
                      : ""
                  } ${
                    pathname === link.href
                      ? "text-white font-semibold" 
                      : isScrolled ? "text-beige-light hover:text-white" : "text-white hover:text-beige-light"
                  }`}
                >
                  {link.name}
                  {pathname === link.href && (
                    <motion.span
                      className={`absolute bottom-0 left-0 h-0.5 w-full ${isScrolled ? "bg-beige-light" : "bg-white"}`}
                      layoutId="underline"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar; 