"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, MinusIcon, XMarkIcon, ShoppingCartIcon as SolidShoppingCartIcon, CreditCardIcon, ReceiptPercentIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import Link from 'next/link';
import { supabase } from "@/lib/supabaseClient"; // Assuming your Supabase client is here
import { InformationCircleIcon, ShoppingCartIcon, XCircleIcon, MinusCircleIcon, PlusCircleIcon, CurrencyDollarIcon, CheckCircleIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, CogIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

// Costs for modifications - ensure these are consistent with your actual costs
const OAT_MILK_COST = 0.40;
const SYRUP_COST = 0.40;
// No SPECIALTY_DISCOUNT for live orders, adjust if needed

interface DrinkCustomizationConfig {
  noCustomization?: boolean;
  milkOptions?: boolean;
  syrupOptions?: boolean;
  decafOption?: boolean;
}

const drinkConfigs: Record<string, DrinkCustomizationConfig> = {
  'espresso': { milkOptions: false, syrupOptions: false, decafOption: true, noCustomization: false }, // Decaf is the only option
  'macchiato': { milkOptions: true, syrupOptions: true, decafOption: true, noCustomization: false },
  'americano': { milkOptions: true, syrupOptions: true, decafOption: true, noCustomization: false },
  'cortado': { milkOptions: true, syrupOptions: true, decafOption: true, noCustomization: false },
  'flatWhite': { milkOptions: true, syrupOptions: true, decafOption: true, noCustomization: false },
  'latte': { milkOptions: true, syrupOptions: true, decafOption: true, noCustomization: false },
  'cappuccino': { milkOptions: true, syrupOptions: true, decafOption: true, noCustomization: false },
  'icedLatte': { milkOptions: true, syrupOptions: true, decafOption: true, noCustomization: false },
  'icedAmericano': { milkOptions: true, syrupOptions: true, decafOption: true, noCustomization: false },
  'matchaHot': { milkOptions: true, syrupOptions: true, decafOption: false, noCustomization: false }, // No decaf for Matcha/Hojicha
  'matchaIced': { milkOptions: true, syrupOptions: true, decafOption: false, noCustomization: false },
  'hojichaHot': { milkOptions: true, syrupOptions: true, decafOption: false, noCustomization: false },
  'hojichaIced': { milkOptions: true, syrupOptions: true, decafOption: false, noCustomization: false },
  'hkIcedLemonTea': { noCustomization: true },
  'yuzuTeaHot': { noCustomization: true },
  'yuzuTeaIced': { noCustomization: true },
  'genmaichaHot': { noCustomization: true },
  'genmaichaIced': { noCustomization: true },
};

// Type for base drinks
interface BaseDrink {
  id: string;
  name: string;
  category: "hotCoffee" | "icedCoffee" | "specialtyDrinks" | "other"; // Added 'other' for flexibility
  price: number;
  isIced?: boolean; // Optional: to distinguish iced variants if not in name
}

// Type for items in the current order's customization
interface OrderItemCustomizations {
  hasOatMilk: boolean;
  syrups: { // Changed from single syrup string to object for multiple selections
    caramel: boolean;
    vanilla: boolean;
  };
  hasSemiSkimmedMilk: boolean;
  isDecaf: boolean;
  isIced: boolean;
}

// Interface for items in the current order list
interface OrderItem {
  id: string; // Unique ID for the item in the *current* frontend order list
  baseDrinkId: string; // e.g., "latte", "espresso"
  baseDrinkName: string;
  customizations: OrderItemCustomizations;
  quantity: number;
  unitPrice: number; // Calculated price after customizations
  originalBasePrice: number; // Store original base price for reference
}

// Type for the customization state (when pane is open)
interface CustomizationState {
  drink: BaseDrink;
  customizations: OrderItemCustomizations;
  quantity: number;
}

// Type for Sales Statistics
interface SalesStats {
  totalDrinksSold: number;
  totalRevenue: number;
  drinksBreakdown: Record<string, { name: string; count: number; revenue: number }>;
  // popularModifications: Record<string, number>; // For future enhancement
}

// Helper to generate a unique ID for order items
const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export default function CashierPage() {
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState(""); // State for customer name
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitOrderStatus, setSubmitOrderStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [showCustomizationPane, setShowCustomizationPane] = useState(false);
  const [customizationItem, setCustomizationItem] = useState<CustomizationState | null>(null);

  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Drink definitions - adapt from preorder/page.tsx or fetch from DB if preferred
  // For simplicity, keeping them here. Ensure IDs are unique and match `live_order_items.drink_id`
  const availableDrinks: BaseDrink[] = useMemo(() => [
    // Hot Coffee
    { id: "espresso", name: "Espresso", category: "hotCoffee", price: 3.00 },
    { id: "macchiato", name: "Macchiato", category: "hotCoffee", price: 3.00 },
    { id: "americano", name: "Americano", category: "hotCoffee", price: 3.00 },
    { id: "cortado", name: "Cortado", category: "hotCoffee", price: 3.00 },
    { id: "flatWhite", name: "Flat White", category: "hotCoffee", price: 3.00 },
    { id: "latte", name: "Latte", category: "hotCoffee", price: 3.00 },
    { id: "cappuccino", name: "Cappuccino", category: "hotCoffee", price: 3.00 },
    // Iced Coffee
    { id: "icedLatte", name: "Iced Latte", category: "icedCoffee", price: 3.50, isIced: true },
    { id: "icedAmericano", name: "Iced Americano", category: "icedCoffee", price: 3.50, isIced: true },
    // Specialty Drinks
    { id: "matchaHot", name: "Matcha (Hot)", category: "specialtyDrinks", price: 4.00 },
    { id: "matchaIced", name: "Matcha (Iced)", category: "specialtyDrinks", price: 4.00, isIced: true },
    { id: "hojichaHot", name: "Hojicha (Hot)", category: "specialtyDrinks", price: 4.00 },
    { id: "hojichaIced", name: "Hojicha (Iced)", category: "specialtyDrinks", price: 4.00, isIced: true },
    { id: "hkIcedLemonTea", name: "Hong Kong Style Iced Lemon Tea", category: "specialtyDrinks", price: 4.00, isIced: true },
    { id: "yuzuTeaHot", name: "Yuzu Tea (Hot)", category: "specialtyDrinks", price: 4.00 },
    { id: "yuzuTeaIced", name: "Yuzu Tea (Iced)", category: "specialtyDrinks", price: 4.00, isIced: true },
    { id: "genmaichaHot", name: "Genmaicha (Hot)", category: "specialtyDrinks", price: 4.00 },
    { id: "genmaichaIced", name: "Genmaicha (Iced)", category: "specialtyDrinks", price: 4.00, isIced: true },
  ], []);

  const calculateUnitPrice = (
    basePrice: number,
    customizations: OrderItemCustomizations
  ): number => {
    let price = basePrice;
    if (customizations.hasOatMilk) price += OAT_MILK_COST;
    if (customizations.syrups.caramel) price += SYRUP_COST;
    if (customizations.syrups.vanilla) price += SYRUP_COST;
    return Math.max(0, price);
  };

  const openCustomizationPane = (drink: BaseDrink) => {
    const config = drinkConfigs[drink.id] || {};
    if (config.noCustomization) {
      // This case should ideally be handled by the button itself changing behavior
      // For now, if somehow called, add simply.
      addSimpleItemToOrder(drink);
      return;
    }

    setCustomizationItem({
      drink,
      customizations: {
        hasOatMilk: false,
        syrups: { caramel: false, vanilla: false },
        hasSemiSkimmedMilk: (drink.id === 'americano' || drink.id === 'icedAmericano') ? false : (config.milkOptions !== false),
        isDecaf: false,
        isIced: drink.isIced || false,
      },
      quantity: 1,
    });
    setShowCustomizationPane(true);
  };

  const handleCustomizationChange = (
    option: keyof CustomizationState['customizations'] | 'quantity' | 'syrups.caramel' | 'syrups.vanilla',
    value?: boolean | number
  ) => {
    if (!customizationItem) return;
    const newCustomizations = { ...customizationItem.customizations, syrups: { ...customizationItem.customizations.syrups}};
    let newQuantity = customizationItem.quantity;

    if (option === 'quantity') newQuantity = Math.max(1, customizationItem.quantity + (value as number));
    else if (option === 'syrups.caramel') newCustomizations.syrups.caramel = !newCustomizations.syrups.caramel;
    else if (option === 'syrups.vanilla') newCustomizations.syrups.vanilla = !newCustomizations.syrups.vanilla;
    else if (option === 'hasOatMilk') {
      const currentlyHasOat = newCustomizations.hasOatMilk;
      newCustomizations.hasOatMilk = !currentlyHasOat;
      if (newCustomizations.hasOatMilk) {
        newCustomizations.hasSemiSkimmedMilk = false; // Mutual exclusivity
      }
    } else if (option === 'hasSemiSkimmedMilk') {
      const currentlyHasSemi = newCustomizations.hasSemiSkimmedMilk;
      newCustomizations.hasSemiSkimmedMilk = !currentlyHasSemi;
      if (newCustomizations.hasSemiSkimmedMilk) {
        newCustomizations.hasOatMilk = false; // Mutual exclusivity
      }
    } else if (option === 'isDecaf') newCustomizations.isDecaf = !newCustomizations.isDecaf;
    
    setCustomizationItem({ ...customizationItem, customizations: newCustomizations, quantity: newQuantity });
  };

  const addCustomizedItemToOrder = () => {
    if (!customizationItem) return;
    const { drink, customizations, quantity } = customizationItem;
    const unitPrice = calculateUnitPrice(drink.price, customizations);
    const existingItemIndex = currentOrderItems.findIndex(item => 
      item.baseDrinkId === drink.id && JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );
    if (existingItemIndex > -1) {
      const updatedOrderItems = [...currentOrderItems];
      updatedOrderItems[existingItemIndex].quantity += quantity;
      setCurrentOrderItems(updatedOrderItems);
    } else {
      setCurrentOrderItems(prev => [...prev, { id: generateUniqueId(), baseDrinkId: drink.id, baseDrinkName: drink.name, customizations, quantity, unitPrice, originalBasePrice: drink.price }]);
    }
    setShowCustomizationPane(false);
    setCustomizationItem(null);
  };
  
  const addSimpleItemToOrder = (drink: BaseDrink) => {
    const config = drinkConfigs[drink.id] || {};
    const customizations: OrderItemCustomizations = {
       hasOatMilk: false,
       syrups: {caramel: false, vanilla: false},
       // For simple add, default milk based on config. Espresso will have milkOptions: false.
       // Other coffees that can have milk will default to semi-skimmed. Non-customizable drinks get no milk.
       hasSemiSkimmedMilk: config.milkOptions === true && !config.noCustomization,
       isDecaf: false, // Decaf is a choice in customization pane if available
       isIced: drink.isIced || false,
    };
    const unitPrice = calculateUnitPrice(drink.price, customizations);
    const existingItemIndex = currentOrderItems.findIndex(item => 
      item.baseDrinkId === drink.id && JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );
    if (existingItemIndex > -1) {
      const updatedOrderItems = [...currentOrderItems];
      updatedOrderItems[existingItemIndex].quantity += 1;
      setCurrentOrderItems(updatedOrderItems);
    } else {
      setCurrentOrderItems(prev => [...prev, { id: generateUniqueId(), baseDrinkId: drink.id, baseDrinkName: drink.name, customizations, quantity: 1, unitPrice, originalBasePrice: drink.price }]);
    }
  };

  const updateOrderItemQuantity = (itemId: string, amount: number) => {
    setCurrentOrderItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item).filter(item => item.quantity > 0));
  };

  const removeOrderItem = (itemId: string) => setCurrentOrderItems(prev => prev.filter(item => item.id !== itemId));

  const currentOrderTotal = useMemo(() => currentOrderItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0), [currentOrderItems]);

  const handleOrderSubmit = async () => {
    if (currentOrderItems.length === 0) {
      setSubmitOrderStatus({ message: "Cannot submit an empty order.", type: "error" });
      return;
    }
    if (!customerName.trim()) { // Check if customer name is entered
        setSubmitOrderStatus({ message: "Please enter customer name.", type: "error" });
        return;
    }
    setIsSubmittingOrder(true);
    setSubmitOrderStatus(null);

    console.log("[Cashier] Attempting to submit order. Total:", currentOrderTotal, "Customer:", customerName.trim());
    console.log("[Cashier] Current order items before formatting:", JSON.stringify(currentOrderItems, null, 2));

    try {
      const { data: orderData, error: orderError } = await supabase.from("live_orders").insert({ 
        total_amount: currentOrderTotal, 
        status: "pending", // Ensure parent order is set to pending
        customer_name: customerName.trim()
      }).select().single();

      console.log("[Cashier] live_orders insert result - data:", orderData, "error:", orderError);

      if (orderError || !orderData) throw orderError || new Error("Failed to create order entry.");
      
      const orderItemsToInsert = currentOrderItems.map(item => ({
        live_order_id: orderData.id,
        drink_id: item.baseDrinkId,
        drink_name: item.baseDrinkName,
        quantity: item.quantity,
        customizations: item.customizations,
        calculated_unit_price: item.unitPrice,
        status: "pending" // Ensure items are also set to pending
      }));

      console.log("[Cashier] live_order_items to insert:", JSON.stringify(orderItemsToInsert, null, 2));

      const { error: itemsError } = await supabase.from("live_order_items").insert(orderItemsToInsert);
      
      console.log("[Cashier] live_order_items insert result - error:", itemsError);

      if (itemsError) {
        console.error("[Cashier] Error inserting order items, attempting to delete parent order:", itemsError);
        await supabase.from("live_orders").delete().match({ id: orderData.id });
        throw itemsError;
      }
      setSubmitOrderStatus({ message: `Order for ${customerName.trim()} submitted!`, type: "success" });
      setCurrentOrderItems([]);
      setCustomerName("");
    } catch (error: unknown) {
      console.error("[Cashier] Full error during order submission:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      setSubmitOrderStatus({ message: `Error submitting order: ${message}`, type: "error" });
    } finally {
      setIsSubmittingOrder(false);
      setTimeout(() => setSubmitOrderStatus(null), 5000);
    }
  };

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

  const categorizedDrinks = groupDrinksByCategory(availableDrinks);

  const fetchSalesStats = async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    // Define a type for the items fetched for stats
    type FetchedStatItem = {
      drink_name: string;
      quantity: number;
      calculated_unit_price: number;
      customizations: OrderItemCustomizations; // Assuming OrderItemCustomizations is suitable
    };
    try {
      const { data, error } = await supabase
        .from("live_order_items")
        .select("drink_name, quantity, calculated_unit_price, customizations")
        .eq("status", "completed");

      if (error) throw error;

      let totalDrinksSold = 0;
      let totalRevenue = 0;
      const drinksBreakdown: Record<string, { name: string; count: number; revenue: number }> = {};

      data?.forEach((item: FetchedStatItem) => { // Used FetchedStatItem type
        totalDrinksSold += item.quantity;
        totalRevenue += item.quantity * item.calculated_unit_price;
        if (!drinksBreakdown[item.drink_name]) {
          drinksBreakdown[item.drink_name] = { name: item.drink_name, count: 0, revenue: 0 };
        }
        drinksBreakdown[item.drink_name].count += item.quantity;
        drinksBreakdown[item.drink_name].revenue += item.quantity * item.calculated_unit_price;
      });

      setSalesStats({ totalDrinksSold, totalRevenue, drinksBreakdown });
    } catch (error: unknown) { // Changed from any
      console.error("Error fetching sales stats:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      setStatsError(`Failed to load sales statistics: ${message}`);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch stats on initial load
  useEffect(() => {
    fetchSalesStats();
  }, []);

  // --- UI Rendering ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 flex flex-col items-center">
      <header className="w-full max-w-6xl mb-8 text-center">
        <div className="flex justify-between items-center mb-4">
          <Link href="/admin" className="bg-gray-700 hover:bg-gray-600 text-yellow-300 px-4 py-2 rounded-md text-sm font-medium transition-colors">
            &larr; Admin Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-yellow-400">Lemme Cafe - Cashier</h1>
          <Link href="/admin/kitchen" className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
            <RocketLaunchIcon className="h-5 w-5 mr-2"/>
            Kitchen View
          </Link>
        </div>
        <p className="text-lg sm:text-xl text-gray-300 mt-2">Live Order Management</p>
      </header>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Drink Selection */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(categorizedDrinks).map(([category, drinks]) => (
            <section key={category} className="bg-slate-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-yellow-300 capitalize">
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {drinks.map((drink) => (
                  <div key={drink.id} className="bg-slate-700 p-4 rounded-lg shadow-md flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-sky-300">{drink.name}</h3>
                      <p className="text-sm text-gray-400">£{drink.price.toFixed(2)}</p>
                    </div>
                    <div className="mt-3 flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          const config = drinkConfigs[drink.id] || {};
                          if (config.noCustomization) {
                            addSimpleItemToOrder(drink);
                          } else {
                            openCustomizationPane(drink);
                          }
                        }}
                        className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-md text-sm transition-colors w-full"
                      >
                        {drinkConfigs[drink.id]?.noCustomization ? "Add to Order" : "Customize"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Column 2: Current Order & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-slate-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-yellow-300 flex items-center">
              <SolidShoppingCartIcon className="h-8 w-8 mr-3 text-yellow-400"/> Current Order
            </h2>
            
            <div className="mb-4">
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-1">Customer Name:</label>
              <input 
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full p-2 rounded-md bg-slate-700 text-white placeholder-gray-400 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>

            {currentOrderItems.length === 0 ? (
              <p className="text-gray-400 italic">No items in order yet.</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700">
                {currentOrderItems.map(item => (
                  <div key={item.id} className="bg-slate-700 p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sky-300">{item.baseDrinkName} <span className="text-xs">({item.quantity})</span></h4>
                        <p className="text-xs text-gray-400">
                          {item.customizations.hasOatMilk && "Oat Milk, "}
                          {item.customizations.syrups.caramel && "Caramel Syrup, "}
                          {item.customizations.syrups.vanilla && "Vanilla Syrup, "}
                          {item.customizations.hasSemiSkimmedMilk && "Semi-Skimmed, "}
                          {item.customizations.isDecaf && "Decaf, "}
                          {item.customizations.isIced && "Iced"}
                        </p>
                        <p className="text-xs text-gray-400">Unit Price: £{item.unitPrice.toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeOrderItem(item.id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <XMarkIcon className="h-5 w-5"/>
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <button onClick={() => updateOrderItemQuantity(item.id, -1)} className="bg-slate-600 hover:bg-slate-500 text-white p-1 rounded-full transition-colors"><MinusIcon className="h-4 w-4"/></button>
                      <span className="text-sm text-white">{item.quantity}</span>
                      <button onClick={() => updateOrderItemQuantity(item.id, 1)} className="bg-slate-600 hover:bg-slate-500 text-white p-1 rounded-full transition-colors"><PlusIcon className="h-4 w-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-slate-600">
              <p className="text-2xl font-bold text-white">Total: £{currentOrderTotal.toFixed(2)}</p>
              <button 
                onClick={handleOrderSubmit} 
                disabled={isSubmittingOrder || currentOrderItems.length === 0}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <CreditCardIcon className="h-5 w-5 mr-2"/>
                {isSubmittingOrder ? "Submitting..." : "Submit Order"}
              </button>
              {submitOrderStatus && (
                <p className={`mt-3 text-sm text-center ${submitOrderStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{submitOrderStatus.message}</p>
              )}
            </div>
          </section>

          {/* Sales Statistics Section - Collapsible */}
          <details className="bg-slate-800 p-6 rounded-xl shadow-lg group">
            <summary className="text-xl font-semibold text-yellow-300 cursor-pointer flex items-center justify-between hover:text-yellow-200 transition-colors">
              Sales Statistics
              <ReceiptPercentIcon className="h-6 w-6 text-gray-400 group-hover:text-yellow-300 transition-colors"/>
            </summary>
            <div className="mt-4">
              <button 
                onClick={fetchSalesStats} 
                disabled={isLoadingStats}
                className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-70"
              >
                {isLoadingStats ? "Loading..." : "Refresh Statistics"}
              </button>
              {statsError && <p className="text-red-400 text-sm">Error: {statsError}</p>}
              {isLoadingStats && <p className="text-gray-400">Loading stats...</p>}
              {salesStats && !isLoadingStats && (
                <div className="space-y-3 text-sm">
                  <p className="text-gray-300"><strong className="text-white">Total Drinks Sold:</strong> {salesStats.totalDrinksSold}</p>
                  <p className="text-gray-300"><strong className="text-white">Total Revenue:</strong> £{salesStats.totalRevenue.toFixed(2)}</p>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Breakdown by Drink:</h4>
                    <ul className="list-disc list-inside pl-1 space-y-1">
                      {Object.values(salesStats.drinksBreakdown).map(drink => (
                        <li key={drink.name} className="text-gray-400">
                          <span className="text-sky-300">{drink.name}</span>: {drink.count} sold (£{drink.revenue.toFixed(2)})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>

      {/* Customization Pane (Modal-like) */}
      <AnimatePresence>
        {showCustomizationPane && customizationItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => setShowCustomizationPane(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">Customize {customizationItem.drink.name}</h2>
                <button onClick={() => setShowCustomizationPane(false)} className="text-gray-400 hover:text-white transition-colors">
                  <XMarkIcon className="h-7 w-7"/>
                </button>
              </div>

              {/* Customizations Options */}
              <div className="space-y-4 sm:space-y-5">
                {/* Milk Options - Conditionally render based on drink type */}
                {(drinkConfigs[customizationItem.drink.id]?.milkOptions !== false && !drinkConfigs[customizationItem.drink.id]?.noCustomization) && (
                  <fieldset className="space-y-2">
                    <legend className="text-lg font-medium mb-1 text-sky-300">
                      {customizationItem.drink.id === 'americano' || customizationItem.drink.id === 'icedAmericano' ? "Milk (Optional)" : "Milk (Select one)"}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {(customizationItem.drink.id === 'americano' || customizationItem.drink.id === 'icedAmericano') ? (
                        // Checkboxes for Americano/Iced Americano
                        <>
                          <label className="flex items-center space-x-2 p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition-colors">
                            <input type="checkbox" name="milk_semi" checked={customizationItem.customizations.hasSemiSkimmedMilk} onChange={() => handleCustomizationChange('hasSemiSkimmedMilk')} className="form-checkbox text-sky-500 focus:ring-sky-400 bg-slate-600 border-slate-500 rounded"/>
                            <span>Semi-Skimmed</span>
                          </label>
                          <label className="flex items-center space-x-2 p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition-colors">
                            <input type="checkbox" name="milk_oat" checked={customizationItem.customizations.hasOatMilk} onChange={() => handleCustomizationChange('hasOatMilk')} className="form-checkbox text-sky-500 focus:ring-sky-400 bg-slate-600 border-slate-500 rounded"/>
                            <span>Oat Milk (+£{OAT_MILK_COST.toFixed(2)})</span>
                          </label>
                        </>
                      ) : (
                        // Radio buttons for other drinks
                        <>
                          <label className="flex items-center space-x-2 p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition-colors">
                            <input type="radio" name="milk" checked={customizationItem.customizations.hasSemiSkimmedMilk} onChange={() => handleCustomizationChange('hasSemiSkimmedMilk')} className="form-radio text-sky-500 focus:ring-sky-400 bg-slate-600 border-slate-500"/>
                            <span>Semi-Skimmed (Default)</span>
                          </label>
                          <label className="flex items-center space-x-2 p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition-colors">
                            <input type="radio" name="milk" checked={customizationItem.customizations.hasOatMilk} onChange={() => handleCustomizationChange('hasOatMilk')} className="form-radio text-sky-500 focus:ring-sky-400 bg-slate-600 border-slate-500"/>
                            <span>Oat Milk (+£{OAT_MILK_COST.toFixed(2)})</span>
                          </label>
                        </>
                      )}
                    </div>
                  </fieldset>
                )}

                {/* Syrup Options - Checkboxes for multiple selection */}
                {(drinkConfigs[customizationItem.drink.id]?.syrupOptions !== false && !drinkConfigs[customizationItem.drink.id]?.noCustomization) && (
                  <fieldset className="space-y-2">
                    <legend className="text-lg font-medium mb-1 text-sky-300">Syrups (Optional)</legend>
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center space-x-2 p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition-colors">
                        <input type="checkbox" checked={customizationItem.customizations.syrups.caramel} onChange={() => handleCustomizationChange('syrups.caramel')} className="form-checkbox text-sky-500 focus:ring-sky-400 bg-slate-600 border-slate-500 rounded"/>
                        <span>Caramel (+£{SYRUP_COST.toFixed(2)})</span>
                      </label>
                      <label className="flex items-center space-x-2 p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition-colors">
                        <input type="checkbox" checked={customizationItem.customizations.syrups.vanilla} onChange={() => handleCustomizationChange('syrups.vanilla')} className="form-checkbox text-sky-500 focus:ring-sky-400 bg-slate-600 border-slate-500 rounded"/>
                        <span>Vanilla (+£{SYRUP_COST.toFixed(2)})</span>
                      </label>
                    </div>
                  </fieldset>
                )}

                {/* Other Options */}
                {(!drinkConfigs[customizationItem.drink.id]?.noCustomization && drinkConfigs[customizationItem.drink.id]?.decafOption !== false) && ( 
                  <fieldset className="space-y-2">
                    <legend className="text-lg font-medium mb-1 text-sky-300">Extras (Optional)</legend>
                    <div className="flex flex-wrap gap-2">
                    {(drinkConfigs[customizationItem.drink.id]?.decafOption !== false) && (
                      <label className="flex items-center space-x-2 p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition-colors">
                        <input type="checkbox" checked={customizationItem.customizations.isDecaf} onChange={() => handleCustomizationChange('isDecaf')} className="form-checkbox text-sky-500 focus:ring-sky-400 bg-slate-600 border-slate-500 rounded"/>
                        <span>Decaf</span>
                      </label>
                    )}
                    </div>
                  </fieldset>
                )}
                
                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-sky-300">Quantity:</span>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => handleCustomizationChange('quantity', -1)} disabled={customizationItem.quantity <= 1} className="bg-slate-600 hover:bg-slate-500 text-white p-2 rounded-full transition-colors disabled:opacity-50"><MinusIcon className="h-5 w-5"/></button>
                    <span className="text-xl font-semibold w-8 text-center">{customizationItem.quantity}</span>
                    <button onClick={() => handleCustomizationChange('quantity', 1)} className="bg-slate-600 hover:bg-slate-500 text-white p-2 rounded-full transition-colors"><PlusIcon className="h-5 w-5"/></button>
                  </div>
                </div>
              </div>

              {/* Total for this item & Add to Order */}
              <div className="mt-8 pt-6 border-t border-slate-600">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-semibold text-sky-300">Item Total:</span>
                  <span className="text-2xl font-bold">£{(calculateUnitPrice(customizationItem.drink.price, customizationItem.customizations) * customizationItem.quantity).toFixed(2)}</span>
                </div>
                <button 
                  onClick={addCustomizedItemToOrder} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors text-lg"
                >
                  Add to Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 