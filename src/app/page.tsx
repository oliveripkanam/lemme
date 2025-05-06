"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import Logo from "@/components/Logo";

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
    <div className="bg-gradient-to-b from-[#2e5937] to-[#f8f5ea] min-h-screen">
      {/* Hero section */}
      <div 
        className="pt-24 pb-16 flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/matcha.jpg')" }}
      >
        <div className="text-center z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <Image
              src="/images/icon.png"
              alt="Lemme Cafe Logo"
              width={500}
              height={500}
              className="mx-auto mb-6"
            />
          </motion.div>
          
          <motion.p 
            className="mt-5 max-w-xl mx-auto text-xl text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            A distinctive Japanese-inspired specialty drinks café, serving the Bath community for one day only.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8"
          >
            <a 
              href="/preorder" 
              className="inline-block bg-primary hover:bg-primary-light text-white font-bold py-3 px-8 rounded-md transition-colors duration-200"
          >
              Pre-order Now
          </a>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* About Us */}
        <AnimatedSection className="mb-16">
          <h2 className="text-3xl font-bold text-[#1a3328] mb-6">About Us</h2>
          <div className="prose prose-primary mx-auto text-gray-800">
            <p>
              Lemme is a distinctive pop-up café with Japanese-inspired specialty drinks, serving the Bath community for one day in June 2025. Our concept combines authentic Japanese beverages rarely found in Bath with a streamlined pricing model and strong environmental commitment.
            </p>
            <p className="mt-4">
              We focus on creating unique, high-quality drinks that stand out in the local market while maintaining accessible pricing and a commitment to sustainability.
            </p>
          </div>
        </AnimatedSection>

        {/* Location and Time */}
        <AnimatedSection className="mb-16" delay={0.2}>
          <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200">
            <h2 className="text-3xl font-bold text-[#1a3328] mb-4">Location & Time</h2>
            <div className="flex flex-col sm:flex-row text-center sm:text-left gap-8 justify-center items-center">
              <div>
                <h3 className="text-lg font-semibold text-primary">When</h3>
                <p className="text-gray-800">June 3rd, 2025</p>
                <p className="text-gray-800">10:00 AM - 4:00 PM</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Where</h3>
                <p className="text-gray-800">Bath City Centre</p>
                <p className="text-gray-800">(Exact location to be announced)</p>
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
                key={member.email} 
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <h3 className="text-xl font-semibold text-[#1a3328]">{member.name}</h3>
                <p className="text-primary font-medium">{member.title}</p>
                <p className="text-gray-700 mt-2">{member.responsibility}</p>
                <p className="text-gray-600 text-sm mt-4">{member.email}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
