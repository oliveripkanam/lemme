"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link'; // Import Link for client-side navigation
import { XMarkIcon } from '@heroicons/react/24/solid'; // Import XMarkIcon

export default function GalleryPage() { // Renamed function
  const imageNumbers = Array.from({ length: 6 }, (_, i) => i + 5); // Generates numbers 5 through 10
  const imageBaseUrl = '/images/';

  return (
    <div className="bg-gradient-to-b from-[#2e5937] to-[#f8f5ea] min-h-screen text-[#1a3328] py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center relative">
      
      <motion.h1
        className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-8 text-center pt-12 sm:pt-0" // Added padding top for heading to avoid overlap with X button on small screens
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Our Images
      </motion.h1>

      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Link href="/preorder" passHref legacyBehavior>
          <motion.a
            className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 text-lg shadow-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#2e5937]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Look delicious? Pre-order now!
          </motion.a>
        </Link>
      </motion.div>

      <div className="w-full max-w-2xl space-y-6 md:space-y-8">
        {imageNumbers.map((num, index) => (
          <motion.div
            key={num}
            className="bg-white/10 backdrop-filter backdrop-blur-md p-2 rounded-xl shadow-lg overflow-hidden w-full cursor-pointer" // Added cursor-pointer for hover indication
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }} // Added image hover effect
          >
            <div className="relative w-full" style={{ paddingTop: '75%' }}> {/* 4:3 Aspect Ratio, adjust as needed */}
              <Image
                src={`${imageBaseUrl}${num}.png`}
                alt={`Lemme Cafe Image ${num}`}
                layout="fill"
                objectFit="contain" // Use contain to ensure the whole image is visible
                className="rounded-lg"
                priority={index < 2} // Prioritize loading for the first few images
              />
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
} 