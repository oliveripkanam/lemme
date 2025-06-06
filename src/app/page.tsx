"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from 'next/link';
import AnimatedSection from "@/components/AnimatedSection";
import { UserCircleIcon } from "@heroicons/react/24/solid";

export default function AboutPage() {
  // Team members data
  const teamMembers = [
    {
      name: "Dorothy Lau",
      title: "Team Leader",
      email: "lemmesipcafe@gmail.com",
      responsibility: "Overall management and strategy",
    },
    {
      name: "Nicole Lee",
      title: "Assistant Team Leader",
      email: "lemmesipcafe@gmail.com",
      responsibility: "Operations and customer service",
    },
    {
      name: "Chloe Ho",
      title: "Publicity",
      email: "lemmesipcafe@gmail.com",
      responsibility: "Marketing and social media",
    },
    {
      name: "Nicole Leung",
      title: "Treasurer",
      email: "lemmesipcafe@gmail.com",
      responsibility: "Financial management and cash handling",
    },
    {
      name: "Oliver Ip",
      title: "Procurement",
      email: "lemmesipcafe@gmail.com",
      responsibility: "Inventory and supplier management",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-[#2e5937] to-[#f8f5ea] min-h-screen text-[#1a3328]">
      {/* Hero section */}
      <div className="pt-20 md:pt-28 pb-16 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Left side: Text content & CTAs */}
            <motion.div 
              className="md:w-5/12 text-center md:text-left flex flex-col items-center md:items-center"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
        <Image
                  src="/images/icon.png"
                  alt="Lemme Cafe Logo"
                  width={420}
                  height={420}
                  className="mx-auto md:mx-0"
          priority
        />
              </motion.div>

              <p className="text-xl sm:text-2xl text-white mb-8 max-w-md mx-auto md:mx-0">
                A distinctive Japanese-inspired specialty drinks café, serving the Bath community for one day only.
              </p>
              <div className="flex flex-col items-center md:items-center">
                <AnimatedSection delay={0.5}>
                  <div className="mt-3 mb-12 text-center">
                    <div className="flex flex-row items-start justify-center gap-x-6 gap-y-4">
                      <div className="flex flex-col items-center">
                        <motion.a
                          href="/preorder"
                          className="bg-transparent border-2 border-white text-white font-bold py-3 px-4 sm:px-8 rounded-lg hover:bg-white/20 hover:text-primary transition-colors duration-300 text-base sm:text-lg shadow-md focus:outline-none focus:ring-0"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Pre-order Now
                        </motion.a>
                        <div className="mt-2 text-yellow-400 text-sm font-medium">
                          ✨ get a discount ✨
                        </div>
                      </div>

                      <Link href="/menu" passHref legacyBehavior>
                        <motion.a
                          className="bg-transparent border-2 border-white text-white font-bold py-3 px-4 sm:px-8 rounded-lg hover:bg-white/20 hover:text-primary transition-colors duration-300 text-base sm:text-lg shadow-md focus:outline-none focus:ring-0"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Our Menu
                        </motion.a>
                      </Link>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </motion.div>
            {/* Right side: Image/Graphic */}
            <motion.div 
              className="md:w-7/12 w-full mt-8 md:mt-0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-white/10 backdrop-filter backdrop-blur-sm p-1 rounded-xl shadow-xl flex items-center justify-center overflow-hidden h-80 md:h-[450px] lg:h-[500px]">
          <Image
                  src="/images/matcha.jpg"
                  alt="Matcha Latte"
                  width={800}
                  height={600}
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* About Us */}
        <AnimatedSection className="mb-16">
          <h2 className="text-3xl font-bold text-[#1a3328] mb-4 text-center">About Us</h2>
          <div className="w-3/4 md:w-1/2 mx-auto h-px bg-gradient-to-r from-transparent via-primary-dark to-transparent mb-8"></div>
          <div className="bg-white/10 backdrop-filter backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-lg">
            <p className="text-gray-800 text-lg leading-relaxed">
              Lemme is a distinctive pop-up café with Japanese-inspired specialty drinks, serving the Bath community for one day in June 2025. Our concept combines authentic Japanese beverages rarely found in Bath with a streamlined pricing model and strong environmental commitment.
            </p>
            <p className="mt-4 text-gray-800 text-lg leading-relaxed">
              We focus on creating unique, high-quality drinks that stand out in the local market while maintaining accessible pricing and a commitment to sustainability.
            </p>
          </div>
        </AnimatedSection>

        {/* Location and Time */}
        <AnimatedSection className="mb-16" delay={0.2}>
          {/* Title outside the card */}
          <h2 className="text-3xl font-bold text-[#1a3328] mb-6 text-center">Location & Time</h2>
          <div className="bg-white/10 backdrop-filter backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
            <div className="flex flex-col lg:flex-row min-h-[400px]">
              {/* Left side: When and Where text (20%) */}
              <div className="lg:w-1/5 w-full p-6 flex flex-col justify-center bg-white">
                {/* When Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary-dark mb-2">When</h3>
                  <p className="text-gray-800 text-base mb-1">June 3rd, 2025</p>
                  <p className="text-gray-800 text-base">10:00 AM - 4:00 PM</p>
                </div>
                
                {/* Separator */}
                <div className="h-px bg-primary-dark/30 mb-6"></div>
                
                {/* Where Section */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark mb-2">Where</h3>
                  <p className="text-gray-800 text-base mb-1">22C New Bond Street, Bath, BA1 1BA</p>
                  <p className="text-gray-800 text-sm">(30 seconds walk from Waitrose)</p>
                </div>
              </div>
              
              {/* Right side: Google Maps (80%) */}
              <div className="lg:w-4/5 w-full h-64 lg:h-auto">
                <iframe
                  src="https://maps.google.com/maps?q=22C+New+Bond+Street,+Bath,+BA1+1BA,+UK&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lemme Cafe Location - 22C New Bond Street, Bath"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Team Members */}
        <AnimatedSection delay={0.3}>
          <h2 className="text-3xl font-bold text-[#1a3328] mb-8 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={member.name}
                className="bg-white/10 hover:bg-white/20 backdrop-filter backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-24 h-24 rounded-full bg-beige-light flex items-center justify-center mb-4 ring-2 ring-white/30">
                  <UserCircleIcon className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-[#1a3328]">{member.name}</h3>
                <p className="text-primary-dark font-medium">{member.title}</p>
                <p className="text-gray-700 mt-2 mb-2 text-sm">{member.responsibility}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
