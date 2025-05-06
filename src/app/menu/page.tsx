"use client";

import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";

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
    <div className="bg-gradient-to-b from-[#2e5937] to-[#f8f5ea] min-h-screen">
      {/* Hero Section */}
      <div className="h-[40vh] flex items-center justify-center text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white sm:text-5xl sm:tracking-tight">
            Our Menu
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-white">
            Japanese-inspired specialty drinks with simple, transparent pricing.
          </p>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {menuCategories.map((category, categoryIndex) => (
          <AnimatedSection key={category.id} delay={categoryIndex * 0.1} className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">
              {category.title} - {category.basePrice}
            </h2>
            
            {category.id === "specialty-drinks" && (
              <p className="text-primary font-medium mb-6">
                Save 20p with pre-order!
              </p>
            )}
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <motion.div 
                  key={item.id} 
                  className="bg-white rounded-md p-6 shadow-md border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-[#1a3328]">{item.name}</h3>
                    <div>
                      {item.discountedPrice ? (
                        <div className="flex flex-col items-end">
                          <span className="line-through text-gray-500 text-sm">{item.price}</span>
                          <span className="text-primary font-medium">{item.discountedPrice}</span>
                        </div>
                      ) : (
                        <span className="text-primary font-medium">{item.price}</span>
                      )}
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        ))}

        {/* Additional Menu Notes */}
        <AnimatedSection delay={0.3} className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-[#1a3328] mb-4">Menu Notes</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>All drinks can be made with oat milk at no extra charge.</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Bring your own cup and get a 20p discount on any drink.</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Pre-order specialty drinks online and save 20p per drink.</span>
            </li>
          </ul>
        </AnimatedSection>
      </div>
    </div>
  );
} 