"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Logo from './Logo'; // Assuming Logo component is in the same directory or adjust path

const Footer = () => {
  const footerLinks = [
    { name: "About", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Pre-order", href: "/preorder" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold text-primary-light mb-4">Lemme</h3>
              <p className="text-gray-300 max-w-sm">
                A Japanese-inspired pop-up café, bringing unique specialty drinks to Bath for one day only in June 2025.
              </p>
            </motion.div>
          </div>
          
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">
                Navigation
              </h3>
              <ul className="space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-primary-light transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
          
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">
                Contact
              </h3>
              <a 
                href="https://www.instagram.com/_lemme.sip_/#" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block text-gray-400 hover:text-primary-light transition-colors duration-200 mb-2"
              >
                Instagram
              </a>
              <p className="text-gray-400">lemmesipcafe@gmail.com</p>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          className="border-t border-gray-800 pt-6 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Lemme Pop-Up Café. All rights reserved.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            One day pop-up in Bath • June 3rd, 2025
          </p>
        </motion.div>

        {/* Bottom Bar with copyright and dev link */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Lemme Sip Cafe. All rights reserved.
          </p>
          <Link href="/admin" legacyBehavior>
            <a className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-300 mt-4 sm:mt-0">
              Dev
            </a>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 