"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import AnimatedSection from "@/components/AnimatedSection";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, MinusIcon, XMarkIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";
import { supabase } from "@/lib/supabaseClient";

const OAT_MILK_COST = 0.40;
const SYRUP_COST = 0.40;
const SPECIALTY_DISCOUNT = 0.20;

// Type for base drinks available for selection
type BaseDrink = {
  id: string;
  name: string;
  category: "hotCoffee" | "coldDrinks" | "specialtyDrinks";
  price: number; // Store as number
};

// Type for items in the shopping cart
interface CartItem {
  id: string; // Unique ID for this cart line item (e.g., generated UUID or composite key)
  baseDrinkId: string;
  baseDrinkName: string;
  hasOatMilk: boolean;
  hasSyrup: boolean;
  quantity: number;
  unitPrice: number; // Final price for this specific variant including options and discounts
  originalBasePrice: number; // Base price before any modifications or discounts
  isSpecialty: boolean;
}

// Type for the customization modal
interface CustomizationModalData {
  drink: BaseDrink;
  oatMilk: boolean;
  syrup: boolean;
  quantity: number;
}

type FormData = {
  name: string;
  email: string;
  pickupTime: string;
  // Drinks are now handled by cartItems state
};

// Helper to generate a unique ID for cart items
const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export default function PreorderPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [modalData, setModalData] = useState<CustomizationModalData | null>(null);

  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm<FormData>({
    mode: "onChange"
  });

  const availableDrinks: BaseDrink[] = useMemo(() => [
    // Hot Coffee
    { id: "espresso", name: "Espresso", category: "hotCoffee", price: 3.00 },
    { id: "macchiato", name: "Macchiato", category: "hotCoffee", price: 3.00 },
    { id: "americano", name: "Americano", category: "hotCoffee", price: 3.00 },
    { id: "cortado", name: "Cortado", category: "hotCoffee", price: 3.00 },
    { id: "flatWhite", name: "Flat White", category: "hotCoffee", price: 3.00 },
    { id: "latte", name: "Latte", category: "hotCoffee", price: 3.00 },
    { id: "cappuccino", name: "Cappuccino", category: "hotCoffee", price: 3.00 },
    // Cold Drinks
    { id: "icedLatte", name: "Iced Latte", category: "coldDrinks", price: 3.50 },
    { id: "icedAmericano", name: "Iced Americano", category: "coldDrinks", price: 3.50 },
    // Specialty Drinks
    { id: "matchaHot", name: "Matcha (Hot)", category: "specialtyDrinks", price: 4.00 },
    { id: "matchaIced", name: "Matcha (Iced)", category: "specialtyDrinks", price: 4.00 },
    { id: "hojichaHot", name: "Hojicha (Hot)", category: "specialtyDrinks", price: 4.00 },
    { id: "hojichaIced", name: "Hojicha (Iced)", category: "specialtyDrinks", price: 4.00 },
    { id: "icedLemonTea", name: "Iced Lemon Tea", category: "specialtyDrinks", price: 4.00 },
    { id: "yuzuTeaHot", name: "Yuzu Tea (Hot)", category: "specialtyDrinks", price: 4.00 },
    { id: "yuzuTeaIced", name: "Yuzu Tea (Iced)", category: "specialtyDrinks", price: 4.00 },
    { id: "genmaichaHot", name: "Genmaicha (Hot)", category: "specialtyDrinks", price: 4.00 },
    { id: "genmaichaIced", name: "Genmaicha (Iced)", category: "specialtyDrinks", price: 4.00 },
  ], []);

  const calculateUnitPrice = (basePrice: number, isSpecialty: boolean, hasOat: boolean, hasSyrup: boolean): number => {
    let price = basePrice;
    if (isSpecialty) {
      price -= SPECIALTY_DISCOUNT;
    }
    if (hasOat) {
      price += OAT_MILK_COST;
    }
    if (hasSyrup) {
      price += SYRUP_COST;
    }
    return Math.max(0, price); // Ensure price doesn't go below 0
  };

  const openCustomizationModal = (drink: BaseDrink) => {
    setModalData({ drink, oatMilk: false, syrup: false, quantity: 1 });
    setShowCustomizationModal(true);
  };

  const handleModalQuantityChange = (amount: number) => {
    if (modalData) {
      setModalData({ ...modalData, quantity: Math.max(1, modalData.quantity + amount) });
    }
  };

  const handleModalOptionChange = (option: 'oatMilk' | 'syrup') => {
    if (modalData) {
      setModalData({ ...modalData, [option]: !modalData[option] });
    }
  };
  
  const addOrUpdateCartItem = () => {
    if (!modalData) return;

    const { drink, oatMilk, syrup, quantity } = modalData;
    const unitPrice = calculateUnitPrice(drink.price, drink.category === 'specialtyDrinks', oatMilk, syrup);
    
    // Check if an identical item already exists
    const existingItemIndex = cartItems.findIndex(item => 
      item.baseDrinkId === drink.id &&
      item.hasOatMilk === oatMilk &&
      item.hasSyrup === syrup
    );

    if (existingItemIndex > -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += quantity;
      setCartItems(updatedCartItems);
    } else {
      const newItem: CartItem = {
        id: generateUniqueId(),
        baseDrinkId: drink.id,
        baseDrinkName: drink.name,
        hasOatMilk: oatMilk,
        hasSyrup: syrup,
        quantity: quantity,
        unitPrice: unitPrice,
        originalBasePrice: drink.price,
        isSpecialty: drink.category === 'specialtyDrinks'
      };
      setCartItems([...cartItems, newItem]);
    }
    setShowCustomizationModal(false);
    setModalData(null);
  };

  const updateCartItemQuantity = (cartItemId: string, amount: number) => {
    setCartItems(prevCart => {
      const itemIndex = prevCart.findIndex(item => item.id === cartItemId);
      if (itemIndex === -1) return prevCart;

      const updatedCart = [...prevCart];
      const newQuantity = updatedCart[itemIndex].quantity + amount;

      if (newQuantity <= 0) {
        updatedCart.splice(itemIndex, 1); // Remove item if quantity is 0 or less
      } else {
        updatedCart[itemIndex].quantity = newQuantity;
      }
      return updatedCart;
    });
  };
  
  const removeCartItem = (cartItemId: string) => {
    setCartItems(prevCart => prevCart.filter(item => item.id !== cartItemId));
  };

  const orderTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  }, [cartItems]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    if (cartItems.length === 0) {
      setSubmitError("Please add at least one drink to your order.");
      setIsSubmitting(false);
      return;
    }

    const orderDataForSupabase = {
      name: data.name,
      email: data.email,
      pickup_time: data.pickupTime,
      drinks: cartItems.map(item => ({ // Transform cart items for Supabase
        id: item.baseDrinkId, // or item.id if you want the unique cart item ID
        name: item.baseDrinkName,
        quantity: item.quantity,
        options: {
          oatMilk: item.hasOatMilk,
          syrup: item.hasSyrup,
        },
        unitPrice: item.unitPrice,
        isSpecialty: item.isSpecialty,
        originalBasePrice: item.originalBasePrice,
      })),
      total_price: parseFloat(orderTotal.toFixed(2)),
      is_collected: false, // Default value
    };
    
    try {
      const { error } = await supabase
        .from('preorders')
        .insert([orderDataForSupabase]);

      if (error) throw error;

      setOrderSuccess(true);
      reset(); 
      setCartItems([]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setSubmitError(`Failed to submit order: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = useMemo(() => {
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
  }, []);
  
  const groupDrinksByCategory = (drinks: BaseDrink[]) => {
    return drinks.reduce((acc, drink) => {
      const category = drink.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(drink);
      return acc;
    }, {} as Record<BaseDrink['category'], BaseDrink[]>);
  };
  const groupedDrinks = groupDrinksByCategory(availableDrinks);


  if (orderSuccess) {
    return (
      <div className="bg-gradient-to-b from-[#2e5937] to-[#f8f5ea] py-16 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-xl shadow-2xl">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a3328] mt-4">Pre-order Successful!</h1>
            <div className="mt-4">
              <p className="text-base sm:text-lg text-gray-700">Thank you for your pre-order. We look forward to seeing you on June 3rd!</p>
              <button 
                onClick={() => { setOrderSuccess(false); setCartItems([]); }}
                className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
              >Place Another Order</button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#2e5937] to-[#f8f5ea] min-h-screen">
      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl font-bold text-white sm:text-5xl sm:tracking-tight">Pre-order Your Drinks</h1>
            <p className="mt-5 max-w-xl mx-auto text-lg sm:text-xl text-white">Pre-order now to skip the queue! Your drinks will be prioritized when you arrive.</p>
            <p className="mt-3 max-w-xl mx-auto text-base sm:text-lg text-primary font-medium">
              Plus, get 20p off all specialty drinks! (Base price)
            </p>
             <p className="mt-4 max-w-xl mx-auto text-sm text-yellow-300">
              Oat Milk: +£{OAT_MILK_COST.toFixed(2)} &nbsp;&nbsp;|&nbsp;&nbsp; Add Syrup: +£{SYRUP_COST.toFixed(2)}
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left side: Drink Selection */}
          <div className="lg:col-span-2 space-y-8">
            {Object.entries(groupedDrinks).map(([category, drinksInCategory]) => (
              <AnimatedSection key={category} className="bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-200">
                <h2 className="text-xl sm:text-2xl font-semibold text-[#1a3328] mb-4 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()} 
                  {category === 'specialtyDrinks' && <span className="text-sm text-primary font-normal"> (20p off base price)</span>}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {drinksInCategory.map((drink) => (
                    <motion.div 
                      key={drink.id}
                      className="border border-gray-200 rounded-md p-3 hover:shadow-lg transition-shadow duration-200 flex items-center justify-between"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div>
                        <h3 className="font-medium text-[#1a3328] text-base sm:text-lg">{drink.name}</h3>
                        <p className="text-sm text-gray-600">Base Price: £{drink.price.toFixed(2)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openCustomizationModal(drink)}
                        className="ml-2 p-2 bg-primary-light hover:bg-primary text-white rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                        aria-label={`Customize and add ${drink.name}`}
                      >
                        <PlusIcon className="h-5 w-5 text-gray-800" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Right side: User Info & Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            <AnimatedSection delay={0.1} className="bg-white rounded-lg p-6 shadow-md border border-gray-200 sticky top-20"> {/* Sticky cart */}
              <h2 className="text-xl font-semibold text-[#1a3328] mb-4">Your Information</h2>
              <form onSubmit={handleSubmit(onSubmit)} id="preorderForm" className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                  <input type="text" id="name" {...register("name", { required: "Name is required" })}
                    className={`mt-1 shadow-sm focus:ring-primary-light focus:border-primary-light block w-full sm:text-sm border-gray-300 bg-white text-gray-800 rounded-md py-2 px-3 ${errors.name ? "border-red-500" : ""}`} />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                  <input type="email" id="email" {...register("email", { required: "Email is required" })}
                    className={`mt-1 shadow-sm focus:ring-primary-light focus:border-primary-light block w-full sm:text-sm border-gray-300 bg-white text-gray-800 rounded-md py-2 px-3 ${errors.email ? "border-red-500" : ""}`} />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700">Pickup Time <span className="text-red-500">*</span></label>
                  <select id="pickupTime" {...register("pickupTime", { required: "Pickup time is required" })}
                    className={`mt-1 shadow-sm focus:ring-primary-light focus:border-primary-light block w-full sm:text-sm border-gray-300 bg-white text-gray-800 rounded-md py-2 px-3 ${errors.pickupTime ? "border-red-500" : ""}`}>
                    <option value="">Select a time</option>
                    {timeSlots.map((time) => <option key={time} value={time}>{time}</option>)}
                  </select>
                  {errors.pickupTime && <p className="mt-1 text-sm text-red-500">{errors.pickupTime.message}</p>}
                </div>
              </form>
              
              <h2 className="text-xl font-semibold text-[#1a3328] mt-6 mb-3 pt-4 border-t border-gray-200">Your Order</h2>
              {cartItems.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <ShoppingCartIcon className="h-12 w-12 mx-auto text-gray-400 mb-2"/>
                  Your cart is empty. Add some drinks!
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2"> {/* Scrollable cart items */}
                  {cartItems.map(item => (
                    <motion.div 
                      key={item.id} 
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-3 border border-gray-200 rounded-md bg-gray-50/50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-[#1a3328]">{item.baseDrinkName}</h4>
                          <div className="text-xs text-gray-600">
                            {item.hasOatMilk && <span>Oat Milk</span>}
                            {item.hasOatMilk && item.hasSyrup && <span>, </span>}
                            {item.hasSyrup && <span>Syrup</span>}
                            {!item.hasOatMilk && !item.hasSyrup && <span>Standard</span>}
                          </div>
                          <p className="text-xs text-primary">Unit Price: £{item.unitPrice.toFixed(2)}</p>
                        </div>
                        <button onClick={() => removeCartItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                          <XMarkIcon className="h-4 w-4"/>
                        </button>
                      </div>
                      <div className="flex items-center justify-end mt-1">
                        <button onClick={() => updateCartItemQuantity(item.id, -1)} className="p-1 rounded-full text-gray-500 hover:text-primary hover:bg-primary-light/20"><MinusIcon className="h-5 w-5" /></button>
                        <span className="w-10 text-center text-sm font-medium text-[#1a3328]">{item.quantity}</span>
                        <button onClick={() => updateCartItemQuantity(item.id, 1)} className="p-1 rounded-full text-gray-500 hover:text-primary hover:bg-primary-light/20"><PlusIcon className="h-5 w-5" /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-[#1a3328]">Total</h3>
                  <p className="text-xl font-semibold text-primary">£{orderTotal.toFixed(2)}</p>
                </div>
                <p className="mt-1 text-sm text-gray-600">Payment will be collected upon pickup.</p>
              </div>
              {submitError && <p className="mt-2 text-sm text-red-600 text-center">{submitError}</p>}
              <button
                type="submit"
                form="preorderForm" // Link to the form
                className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-semibold rounded-lg shadow-sm text-black bg-white hover:bg-beige-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 transform hover:scale-105"
                disabled={!isValid || cartItems.length === 0 || isSubmitting}
              >
                {isSubmitting ? "Placing Order..." : "Place Pre-order"}
              </button>
              {/* Disclaimer Section */}
              <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <p className="font-semibold mb-2 text-gray-700">Important Information:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Confirmation email will be sent within 2 business days.</li>
                  <li>We'll send you a reminder email a week before and a day before June 3rd (the trading day).</li>
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      <AnimatePresence>
        {showCustomizationModal && modalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setShowCustomizationModal(false); setModalData(null);}} // Close on overlay click
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg text-gray-800"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-[#1a3328]">{modalData.drink.name}</h3>
                <button onClick={() => { setShowCustomizationModal(false); setModalData(null);}} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-1">Base Price: £{modalData.drink.price.toFixed(2)}
                {modalData.drink.category === 'specialtyDrinks' && <span className="text-primary ml-1">(-£{SPECIALTY_DISCOUNT.toFixed(2)} pre-order discount)</span>}
              </p>

              <div className="space-y-4 my-6">
                <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <span className="flex items-center">
                    <span>Use Oat Milk</span>
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-3 text-primary">+£{OAT_MILK_COST.toFixed(2)}</span>
                    <input 
                      type="checkbox" 
                      checked={modalData.oatMilk}
                      onChange={() => handleModalOptionChange('oatMilk')}
                      className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary-light border-gray-300"
                    />
                  </div>
                </label>
                <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                   <span className="flex items-center">
                    <span>Add Syrup</span>
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-3 text-primary">+£{SYRUP_COST.toFixed(2)}</span>
                    <input 
                      type="checkbox" 
                      checked={modalData.syrup}
                      onChange={() => handleModalOptionChange('syrup')}
                      className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary-light border-gray-300"
                    />
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-medium text-[#1a3328]">Quantity:</span>
                <div className="flex items-center">
                  <button onClick={() => handleModalQuantityChange(-1)} className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"><MinusIcon className="h-5 w-5" /></button>
                  <span className="w-12 text-center text-lg font-semibold text-primary">{modalData.quantity}</span>
                  <button onClick={() => handleModalQuantityChange(1)} className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"><PlusIcon className="h-5 w-5" /></button>
                </div>
              </div>
              
              <div className="text-right mb-6">
                 <p className="text-sm text-gray-500">Price for this item (x{modalData.quantity}):</p>
                 <p className="text-2xl font-bold text-primary">
                    £{(calculateUnitPrice(modalData.drink.price, modalData.drink.category === 'specialtyDrinks', modalData.oatMilk, modalData.syrup) * modalData.quantity).toFixed(2)}
                 </p>
              </div>

              <button
                onClick={addOrUpdateCartItem}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-lg transition-colors duration-200 flex items-center justify-center shadow-md"
              >
                <ShoppingCartIcon className="h-6 w-6 mr-2" />
                Add to Order
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 