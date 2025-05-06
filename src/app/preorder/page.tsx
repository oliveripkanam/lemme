"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";

type DrinkOption = {
  id: string;
  name: string;
  category: "hotCoffee" | "coldDrinks" | "specialtyDrinks";
  price: string;
  discountedPrice?: string;
  quantity: number;
};

type FormData = {
  name: string;
  email: string;
  pickupTime: string;
  drinks: DrinkOption[];
};

export default function PreorderPage() {
  // Generate time slots from 10am to 4pm in 15 minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour <= 16; hour++) {
      if (hour === 16) {
        slots.push(`${hour}:00`);
      } else {
        for (let minute = 0; minute < 60; minute += 15) {
          slots.push(`${hour}:${minute === 0 ? "00" : minute}`);
        }
      }
    }
    return slots;
  };

  // All available drinks for pre-order with 20p discount on specialty drinks
  const availableDrinks: DrinkOption[] = [
    // Hot Coffee
    { id: "espresso", name: "Espresso", category: "hotCoffee", price: "£3.00", quantity: 0 },
    { id: "macchiato", name: "Macchiato", category: "hotCoffee", price: "£3.00", quantity: 0 },
    { id: "americano", name: "Americano", category: "hotCoffee", price: "£3.00", quantity: 0 },
    { id: "cortado", name: "Cortado", category: "hotCoffee", price: "£3.00", quantity: 0 },
    { id: "flatWhite", name: "Flat White", category: "hotCoffee", price: "£3.00", quantity: 0 },
    { id: "latte", name: "Latte", category: "hotCoffee", price: "£3.00", quantity: 0 },
    { id: "cappuccino", name: "Cappuccino", category: "hotCoffee", price: "£3.00", quantity: 0 },
    
    // Cold Drinks
    { id: "icedLatte", name: "Iced Latte", category: "coldDrinks", price: "£3.50", quantity: 0 },
    { id: "icedAmericano", name: "Iced Americano", category: "coldDrinks", price: "£3.50", quantity: 0 },
    
    // Specialty Drinks - with 20p discount for pre-orders
    { id: "matchaHot", name: "Matcha (Hot)", category: "specialtyDrinks", price: "£4.00", discountedPrice: "£3.80", quantity: 0 },
    { id: "matchaIced", name: "Matcha (Iced)", category: "specialtyDrinks", price: "£4.00", discountedPrice: "£3.80", quantity: 0 },
    { id: "hojichaHot", name: "Hojicha (Hot)", category: "specialtyDrinks", price: "£4.00", discountedPrice: "£3.80", quantity: 0 },
    { id: "hojichaIced", name: "Hojicha (Iced)", category: "specialtyDrinks", price: "£4.00", discountedPrice: "£3.80", quantity: 0 },
    { id: "icedLemonTea", name: "Iced Lemon Tea", category: "specialtyDrinks", price: "£4.00", discountedPrice: "£3.80", quantity: 0 },
    { id: "yuzuTeaHot", name: "Yuzu Tea (Hot)", category: "specialtyDrinks", price: "£4.00", discountedPrice: "£3.80", quantity: 0 },
    { id: "yuzuTeaIced", name: "Yuzu Tea (Iced)", category: "specialtyDrinks", price: "£4.00", discountedPrice: "£3.80", quantity: 0 },
    { id: "genmaichaHot", name: "Genmaicha (Hot)", category: "specialtyDrinks", price: "£4.00", discountedPrice: "£3.80", quantity: 0 },
    { id: "genmaichaIced", name: "Genmaicha (Iced)", category: "specialtyDrinks", price: "£4.00", discountedPrice: "£3.80", quantity: 0 },
  ];

  const [selectedDrinks, setSelectedDrinks] = useState<DrinkOption[]>(availableDrinks);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    const orderedDrinks = selectedDrinks.filter(drink => drink.quantity > 0);
    const orderData = {
      ...data,
      drinks: orderedDrinks,
      orderDate: new Date().toISOString(),
      totalPrice: orderedDrinks.reduce((total, drink) => {
        // Use discounted price for specialty drinks if available
        const price = drink.category === "specialtyDrinks" && drink.discountedPrice
          ? parseFloat(drink.discountedPrice.replace('£', ''))
          : parseFloat(drink.price.replace('£', ''));
          
        return total + (price * drink.quantity);
      }, 0).toFixed(2)
    };
    
    console.log('Order submitted:', orderData);
    setOrderSuccess(true);
  };

  const updateDrinkQuantity = (id: string, quantity: number) => {
    setSelectedDrinks(prev => 
      prev.map(drink => 
        drink.id === id ? { ...drink, quantity } : drink
      )
    );
  };

  // Calculate order total with discounts
  const orderTotal = selectedDrinks
    .filter(drink => drink.quantity > 0)
    .reduce((total, drink) => {
      // Use discounted price for specialty drinks if available
      const price = drink.category === "specialtyDrinks" && drink.discountedPrice
        ? parseFloat(drink.discountedPrice.replace('£', ''))
        : parseFloat(drink.price.replace('£', ''));
        
      return total + (price * drink.quantity);
    }, 0)
    .toFixed(2);

  const timeSlots = generateTimeSlots();

  if (orderSuccess) {
    return (
      <div className="bg-gradient-to-b from-[#2e5937] to-[#f8f5ea] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-[#1a3328]">Pre-order Successful!</h1>
          <div className="mt-4 bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-lg text-gray-700">
              Thank you for your pre-order. We look forward to seeing you on June 3rd!
            </p>
            <button 
              onClick={() => setOrderSuccess(false)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-light hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#2e5937] to-[#f8f5ea] min-h-screen">
      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white sm:text-5xl sm:tracking-tight">
              Pre-order Your Drinks
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-white">
              Skip the queue on June 3rd by pre-ordering your drinks for pickup.
            </p>
            <p className="mt-3 max-w-xl mx-auto text-lg text-primary font-medium">
              Pre-order now and get 20p off all specialty drinks!
            </p>
          </div>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <AnimatedSection delay={0.1} className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-[#1a3328] mb-4">Your Information</h2>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      className={`shadow-sm focus:ring-primary-light focus:border-primary-light block w-full sm:text-sm border-gray-300 bg-white text-gray-800 rounded-md ${
                        errors.name ? "border-red-500" : ""
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      {...register("email", { required: "Email is required" })}
                      className={`shadow-sm focus:ring-primary-light focus:border-primary-light block w-full sm:text-sm border-gray-300 bg-white text-gray-800 rounded-md ${
                        errors.email ? "border-red-500" : ""
                      }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      We'll send you a reminder 1 day before the event.
                    </p>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700">
                    Pickup Time <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="pickupTime"
                      {...register("pickupTime", { required: "Pickup time is required" })}
                      className={`shadow-sm focus:ring-primary-light focus:border-primary-light block w-full sm:text-sm border-gray-300 bg-white text-gray-800 rounded-md ${
                        errors.pickupTime ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {errors.pickupTime && (
                      <p className="mt-1 text-sm text-red-500">{errors.pickupTime.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-[#1a3328] mb-6">Select Your Drinks</h2>
              
              {/* Hot Coffee */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-[#1a3328] mb-4">Hot Coffee - £3.00</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedDrinks
                    .filter((drink) => drink.category === "hotCoffee")
                    .map((drink) => (
                      <motion.div 
                        key={drink.id} 
                        className="border border-gray-200 rounded-md p-4 bg-white hover:bg-gray-50 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex justify-between items-center">
                          <label htmlFor={drink.id} className="font-medium text-[#1a3328]">
                            {drink.name}
                          </label>
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => updateDrinkQuantity(drink.id, Math.max(0, drink.quantity - 1))}
                              className="p-1 text-gray-600 hover:text-[#1a3328]"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              id={drink.id}
                              min="0"
                              value={drink.quantity}
                              onChange={(e) => updateDrinkQuantity(drink.id, parseInt(e.target.value) || 0)}
                              className="w-12 text-center mx-1 border-gray-300 bg-white text-gray-800 rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => updateDrinkQuantity(drink.id, drink.quantity + 1)}
                              className="p-1 text-gray-600 hover:text-[#1a3328]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-primary mt-1">{drink.price}</div>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Cold Drinks */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-[#1a3328] mb-4">Cold Drinks - £3.50</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedDrinks
                    .filter((drink) => drink.category === "coldDrinks")
                    .map((drink) => (
                      <motion.div 
                        key={drink.id} 
                        className="border border-gray-200 rounded-md p-4 bg-white hover:bg-gray-50 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex justify-between items-center">
                          <label htmlFor={drink.id} className="font-medium text-[#1a3328]">
                            {drink.name}
                          </label>
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => updateDrinkQuantity(drink.id, Math.max(0, drink.quantity - 1))}
                              className="p-1 text-gray-600 hover:text-[#1a3328]"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              id={drink.id}
                              min="0"
                              value={drink.quantity}
                              onChange={(e) => updateDrinkQuantity(drink.id, parseInt(e.target.value) || 0)}
                              className="w-12 text-center mx-1 border-gray-300 bg-white text-gray-800 rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => updateDrinkQuantity(drink.id, drink.quantity + 1)}
                              className="p-1 text-gray-600 hover:text-[#1a3328]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-primary mt-1">{drink.price}</div>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Specialty Drinks with discount */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-[#1a3328] mb-4">
                  Specialty Drinks - <span className="text-primary">20p off with pre-order!</span>
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedDrinks
                    .filter((drink) => drink.category === "specialtyDrinks")
                    .map((drink) => (
                      <motion.div 
                        key={drink.id} 
                        className="border border-gray-200 rounded-md p-4 bg-white hover:bg-gray-50 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex justify-between items-center">
                          <label htmlFor={drink.id} className="font-medium text-[#1a3328]">
                            {drink.name}
                          </label>
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => updateDrinkQuantity(drink.id, Math.max(0, drink.quantity - 1))}
                              className="p-1 text-gray-600 hover:text-[#1a3328]"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              id={drink.id}
                              min="0"
                              value={drink.quantity}
                              onChange={(e) => updateDrinkQuantity(drink.id, parseInt(e.target.value) || 0)}
                              className="w-12 text-center mx-1 border-gray-300 bg-white text-gray-800 rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => updateDrinkQuantity(drink.id, drink.quantity + 1)}
                              className="p-1 text-gray-600 hover:text-[#1a3328]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-sm mt-1 flex items-center">
                          <span className="line-through text-gray-500 mr-2">{drink.price}</span>
                          <span className="text-primary font-medium">{drink.discountedPrice}</span>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-8 pt-6 border-t border-gray-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-[#1a3328]">Total</h3>
                  <p className="text-xl font-semibold text-primary">£{orderTotal}</p>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Payment will be collected upon pickup on June 3rd.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3} className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Place Pre-order
              </button>
            </AnimatedSection>
          </form>
        </div>
      </div>
    </div>
  );
} 