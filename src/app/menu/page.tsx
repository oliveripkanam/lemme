"use client";

import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import { CubeTransparentIcon, ArrowPathRoundedSquareIcon, TicketIcon } from "@heroicons/react/24/outline";

type MenuItem = {
  id: string;
  name: string;
  price: string;
  discountedPrice?: string;
  description?: string;
};

export default function MenuPage() {
  // Menu categories with their items
  const menuCategories = [
    {
      id: "hot-coffee",
      title: "Hot Coffee",
      basePrice: "£3.00",
      items: [
        { id: "espresso", name: "Espresso", price: "£3.00" },
        { id: "macchiato", name: "Macchiato", price: "£3.00" },
        { id: "americano", name: "Americano", price: "£3.00" },
        { id: "cortado", name: "Cortado", price: "£3.00" },
        { id: "flat-white", name: "Flat White", price: "£3.00" },
        { id: "latte", name: "Latte", price: "£3.00" },
        { id: "cappuccino", name: "Cappuccino", price: "£3.00" },
      ] as MenuItem[]
    },
    {
      id: "cold-drinks",
      title: "Cold Drinks",
      basePrice: "£3.50",
      items: [
        { id: "iced-latte", name: "Iced Latte", price: "£3.50" },
        { id: "iced-americano", name: "Iced Americano", price: "£3.50" },
      ] as MenuItem[]
    },
    {
      id: "specialty-drinks",
      title: "Specialty Drinks",
      basePrice: "£4.00",
      items: [
        { 
          id: "matcha-hot", 
          name: "Matcha (Hot)", 
          price: "£4.00", 
          discountedPrice: "£3.80",
          description: "Save 20p with pre-order!"
        },
        { 
          id: "matcha-iced", 
          name: "Matcha (Iced)", 
          price: "£4.00", 
          discountedPrice: "£3.80",
          description: "Save 20p with pre-order!"
        },
        { 
          id: "hojicha-hot", 
          name: "Hojicha (Hot)", 
          price: "£4.00", 
          discountedPrice: "£3.80",
          description: "Save 20p with pre-order!"
        },
        { 
          id: "hojicha-iced", 
          name: "Hojicha (Iced)", 
          price: "£4.00", 
          discountedPrice: "£3.80",
          description: "Save 20p with pre-order!"
        },
        { 
          id: "iced-lemon-tea", 
          name: "Iced Lemon Tea", 
          price: "£4.00", 
          discountedPrice: "£3.80",
          description: "Save 20p with pre-order!"
        },
        { 
          id: "yuzu-tea-hot", 
          name: "Yuzu Tea (Hot)", 
          price: "£4.00", 
          discountedPrice: "£3.80",
          description: "Save 20p with pre-order!"
        },
        { 
          id: "yuzu-tea-iced", 
          name: "Yuzu Tea (Iced)", 
          price: "£4.00", 
          discountedPrice: "£3.80",
          description: "Save 20p with pre-order!"
        },
        { 
          id: "genmaicha-hot", 
          name: "Genmaicha (Hot)", 
          price: "£4.00", 
          discountedPrice: "£3.80",
          description: "Save 20p with pre-order!"
        },
        { 
          id: "genmaicha-iced", 
          name: "Genmaicha (Iced)", 
          price: "£4.00", 
          discountedPrice: "£3.80",
          description: "Save 20p with pre-order!"
        },
      ] as MenuItem[]
    }
  ];

  return (
    <div className="bg-gradient-to-b from-[#2e5937] to-[#f8f5ea] min-h-screen text-[#1a3328]">
      {/* Hero Section with coffee.jpg background */}
      <div 
        className="h-[50vh] md:h-[60vh] flex items-center justify-center text-center pt-16 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/images/coffee.jpg')" }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            className="text-5xl font-bold text-white sm:text-6xl lg:text-7xl tracking-tight drop-shadow-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Menu
          </motion.h1>
          <motion.p 
            className="mt-6 max-w-xl mx-auto text-xl text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Japanese-inspired specialty drinks with simple, transparent pricing.
          </motion.p>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {menuCategories.map((category, categoryIndex) => (
          <AnimatedSection key={category.id} delay={categoryIndex * 0.1} className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-3 text-center">
              {category.title}
            </h2>
            <p className="text-center text-beige-light mb-8 text-lg">Base Price: {category.basePrice}</p>
            
            {category.id === "specialty-drinks" && (
              <p className="text-center text-yellow-300 font-semibold mb-8 text-lg">
                ✨ Pre-order specialty drinks & save 20p! ✨
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {category.items.map((item, itemIndex) => (
                <motion.div 
                  key={item.id} 
                  className="bg-white/10 backdrop-filter backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between h-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: itemIndex * 0.05 + categoryIndex * 0.1, duration: 0.4 }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-[#122e21] mr-2 truncate" title={item.name}>{item.name}</h3>
                      <div>
                        {item.discountedPrice ? (
                          <div className="text-right">
                            <span className="text-md line-through text-gray-500">{item.price}</span>
                            <span className="block text-2xl font-bold text-primary-dark ml-2">{item.discountedPrice}</span>
                          </div>
                        ) : (
                          <span className="block text-2xl font-bold text-primary-dark text-right">{item.price}</span>
                        )}
                      </div>
                    </div>
                    
                    {item.description && category.id === "specialty-drinks" && (
                       <p className="text-xs text-yellow-500 mt-1 text-right font-medium">{item.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        ))}

        {/* Additional Menu Notes */}
        <AnimatedSection delay={0.3} className="bg-white/10 backdrop-filter backdrop-blur-md p-8 rounded-xl shadow-xl mt-12">
          <h3 className="text-2xl font-bold text-[#1a3328] mb-6 text-center">Good to Know</h3>
          <ul className="space-y-4 text-beige-light text-lg">
            <li className="flex items-start">
              <CubeTransparentIcon className="h-6 w-6 text-primary-light mr-3 flex-shrink-0" />
              <span>All drinks can be made with oat milk at no extra charge.</span>
            </li>
            <li className="flex items-start">
              <ArrowPathRoundedSquareIcon className="h-6 w-6 text-primary-light mr-3 flex-shrink-0" />
              <span>Bring your own cup and get a 20p discount on any drink.</span>
            </li>
            <li className="flex items-start">
              <TicketIcon className="h-6 w-6 text-primary-light mr-3 flex-shrink-0" />
              <span>Pre-order specialty drinks online and save 20p per drink.</span>
            </li>
          </ul>
        </AnimatedSection>
      </div>
    </div>
  );
} 