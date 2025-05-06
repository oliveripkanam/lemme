"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Logo from "./Logo";

const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const navLinks = [
    { name: "About", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Pre-order", href: "/preorder" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <motion.header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-sm" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Logo size="sm" isDark={true} />
            </Link>
          </div>
          <nav className="flex items-center space-x-1 md:space-x-8">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <Link
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-primary-light"
                      : "text-gray-300 hover:text-primary-light"
                  }`}
                >
                  {link.name}
                  {pathname === link.href && (
                    <motion.span
                      className="absolute bottom-0 left-0 h-0.5 w-full bg-primary-light"
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