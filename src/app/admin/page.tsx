"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // Import supabase client
import { EyeIcon, EyeSlashIcon, MagnifyingGlassIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link'; // Added Link import

// Define types for order data
interface DrinkDetail {
  drink_name: string;
  quantity: number;
  unit_price: number;
  oat_milk?: boolean;
  caramel_syrup?: boolean;
  vanilla_syrup?: boolean;
  semi_skimmed_milk?: boolean;
  is_decaf?: boolean;
  is_specialty?: boolean;
  original_base_price?: number;
}

interface PreOrder {
  id: string; // uuid from Supabase
  created_at: string;
  name: string;
  email: string;
  pickup_time: string;
  drinks: DrinkDetail[];
  total_price: number;
  is_collected: boolean;
}

interface ConfirmModalData {
  orderId: string;
  currentStatus: boolean;
  customerName: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCollected, setShowCollected] = useState(false);

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<ConfirmModalData | null>(null);

  const adminUsername = "lemmesipcafe";
  const adminPassword = "Mylemme2004!";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === adminUsername && password === adminPassword) {
      setIsAuthenticated(true);
      setLoginError("");
      localStorage.setItem("adminAuthenticated", "true"); // Persist auth state
    } else {
      setLoginError("Invalid username or password");
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setOrders([]);
    setFilteredOrders([]);
    localStorage.removeItem("adminAuthenticated");
  };
  
  // Check localStorage for persisted auth state on mount
  useEffect(() => {
    if (localStorage.getItem("adminAuthenticated") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch orders when authenticated
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setFetchError(null);
      try {
        const { data, error } = await supabase
          .from("preorders")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        setOrders(data as PreOrder[] || []);
      } catch (err: unknown) {
        console.error("Error fetching orders:", err);
        const message = err instanceof Error ? err.message : String(err);
        setFetchError(`Failed to fetch orders: ${message}`);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  // Filter orders based on search term and showCollected status
  useEffect(() => {
    let currentOrders = orders;
    if (!showCollected) {
      currentOrders = currentOrders.filter(order => !order.is_collected);
    }

    if (searchTerm.trim() === "") {
      setFilteredOrders(currentOrders);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      setFilteredOrders(
        currentOrders.filter(
          (order) =>
            order.name.toLowerCase().includes(lowerSearchTerm) ||
            order.email.toLowerCase().includes(lowerSearchTerm) ||
            order.pickup_time.includes(lowerSearchTerm) ||
            order.id.toLowerCase().startsWith(lowerSearchTerm) // Search by start of ID
        )
      );
    }
  }, [searchTerm, orders, showCollected]);

  const triggerConfirmation = (orderId: string, currentStatus: boolean, customerName: string) => {
    setOrderToConfirm({ orderId, currentStatus, customerName });
    setShowConfirmModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!orderToConfirm) return;

    const { orderId, currentStatus } = orderToConfirm;

    try {
      if (!currentStatus) {
        // If not collected yet, add to kitchen queue
        const preorder = orders.find(order => order.id === orderId);
        if (!preorder) {
          throw new Error("Preorder not found");
        }

        console.log("[Admin] Adding preorder to kitchen:", preorder);

        // Create live_orders entry
        const { data: liveOrderData, error: liveOrderError } = await supabase
          .from("live_orders")
          .insert({
            total_amount: preorder.total_price,
            status: "pending",
            customer_name: `[PREORDER:${preorder.id}] ${preorder.name}` // Store preorder ID in customer name with prefix
          })
          .select()
          .single();

        console.log("[Admin] Live order creation result:", { liveOrderData, liveOrderError });

        if (liveOrderError || !liveOrderData) {
          throw liveOrderError || new Error("Failed to create live order");
        }

        // Create live_order_items entries
        const liveOrderItems = preorder.drinks.map(drink => ({
          live_order_id: liveOrderData.id,
          drink_id: mapDrinkNameToDrinkId(drink.drink_name),
          drink_name: drink.drink_name,
          quantity: drink.quantity,
          customizations: {
            hasOatMilk: drink.oat_milk || false,
            syrups: {
              caramel: drink.caramel_syrup || false,
              vanilla: drink.vanilla_syrup || false
            },
            hasSemiSkimmedMilk: drink.semi_skimmed_milk || false,
            isDecaf: drink.is_decaf || false,
            isIced: false // Default for preorders
          },
          calculated_unit_price: drink.unit_price,
          status: "pending"
        }));

        console.log("[Admin] Live order items to insert:", liveOrderItems);

        const { error: itemsError } = await supabase
          .from("live_order_items")
          .insert(liveOrderItems);

        console.log("[Admin] Live order items insertion result:", { itemsError });

        if (itemsError) {
          // Cleanup: delete the live_orders entry if items failed
          await supabase.from("live_orders").delete().eq("id", liveOrderData.id);
          throw itemsError;
        }

        // Mark preorder as collected (processed)
        const { error: updateError } = await supabase
          .from("preorders")
          .update({ is_collected: true })
          .eq("id", orderId);

        if (updateError) throw updateError;

        console.log("[Admin] Preorder successfully added to kitchen queue");

      } else {
        // If already collected (in kitchen), revert back to pending and remove from kitchen
        const preorder = orders.find(order => order.id === orderId);
        if (!preorder) {
          throw new Error("Preorder not found");
        }

        console.log("[Admin] Reverting preorder from kitchen back to pending:", preorder);

        // Find the associated live order that was created for this preorder
        const { data: liveOrderData, error: liveOrderFetchError } = await supabase
          .from("live_orders")
          .select("id, customer_name")
          .like("customer_name", `[PREORDER:${orderId}]%`)
          .single();

        if (liveOrderFetchError) {
          console.log("[Admin] No associated live order found:", liveOrderFetchError);
          // Continue anyway - maybe the live order was already processed
        }

        if (liveOrderData) {
          console.log("[Admin] Found associated live order to remove:", liveOrderData.id);
          
          // Delete the live order items first
          const { error: itemsDeleteError } = await supabase
            .from("live_order_items")
            .delete()
            .eq("live_order_id", liveOrderData.id);

          if (itemsDeleteError) {
            console.error("[Admin] Error deleting live order items:", itemsDeleteError);
            throw itemsDeleteError;
          }

          // Delete the live order
          const { error: orderDeleteError } = await supabase
            .from("live_orders")
            .delete()
            .eq("id", liveOrderData.id);

          if (orderDeleteError) {
            console.error("[Admin] Error deleting live order:", orderDeleteError);
            throw orderDeleteError;
          }

          console.log("[Admin] Successfully removed live order from kitchen");
        }

        // Revert preorder status back to pending
        const { error } = await supabase
          .from("preorders")
          .update({ is_collected: false })
          .eq("id", orderId);

        if (error) throw error;

        console.log("[Admin] Successfully reverted preorder to pending and removed from kitchen");
      }

      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, is_collected: !currentStatus } : order
        )
      );
    } catch (err: unknown) {
      console.error("Error updating order status:", err);
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to update order: ${message}`);
    } finally {
      setShowConfirmModal(false);
      setOrderToConfirm(null);
    }
  };

  const handleCancelStatusChange = () => {
    setShowConfirmModal(false);
    setOrderToConfirm(null);
  };

  // Helper function to map preorder drink names to live order drink IDs
  const mapDrinkNameToDrinkId = (drinkName: string): string => {
    const nameToIdMap: Record<string, string> = {
      // Hot Coffee
      "Espresso": "espresso",
      "Macchiato": "macchiato", 
      "Americano": "americano",
      "Cortado": "cortado",
      "Flat White": "flatWhite",
      "Latte": "latte",
      "Cappuccino": "cappuccino",
      // Iced Coffee
      "Iced Latte": "icedLatte",
      "Iced Americano": "icedAmericano",
      // Specialty Drinks
      "Matcha (Hot)": "matchaHot",
      "Matcha (Iced)": "matchaIced",
      "Hojicha (Hot)": "hojichaHot", 
      "Hojicha (Iced)": "hojichaIced",
      "Hong Kong Style Iced Lemon Tea": "hkIcedLemonTea",
      "Yuzu Tea (Hot)": "yuzuTeaHot",
      "Yuzu Tea (Iced)": "yuzuTeaIced",
      "Genmaicha (Hot)": "genmaichaHot",
      "Genmaicha (Iced)": "genmaichaIced"
    };
    
    return nameToIdMap[drinkName] || drinkName.toLowerCase().replace(/\s+/g, '');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2e5937] to-[#f8f5ea] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-[#1a3328]">
        <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-2xl">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-[#1a3328]">
              Admin Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-dark focus:border-primary-dark focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
              </div>
              <div>
                <label htmlFor="password_admin" className="sr-only">
                  Password
                </label>
                <input
                  id="password_admin"
                  name="password_admin"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-dark focus:border-primary-dark focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-center text-sm text-red-600">{loginError}</p>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors duration-300"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // If authenticated, show the admin dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e5937] to-[#f8f5ea] py-10 px-4 sm:px-6 lg:px-8 text-[#1a3328]">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Pre-order Management</h1>
          <div className="flex gap-2 items-center"> {/* Wrapper for buttons */}
            <Link href="/admin/cashier" passHref>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 text-sm shadow-md"
              >
                Cashier UI
              </button>
            </Link>
            <Link href="/admin/kitchen" passHref>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 text-sm shadow-md"
              >
                Kitchen View
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 text-sm shadow-md"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search by Name, Email, Time, Order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-primary-dark text-gray-800 placeholder-gray-500"
                    />
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                </div>
                <button
                    onClick={() => setShowCollected(!showCollected)}
                    className={`flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark ${showCollected ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    {showCollected ? <EyeSlashIcon className="h-5 w-5 mr-2" /> : <EyeIcon className="h-5 w-5 mr-2" />}
                    {showCollected ? "Hide In Kitchen" : "Show In Kitchen"}
                </button>
            </div>
        </div>

        {isLoading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-primary-light mx-auto"></div>
            <p className="mt-3 text-white text-lg">Loading orders...</p>
          </div>
        )}
        {fetchError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 shadow-md" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{fetchError}</span>
          </div>
        )}

        {!isLoading && !fetchError && (
          <div className="overflow-x-auto bg-white bg-opacity-90 backdrop-filter backdrop-blur-md p-1 sm:p-4 rounded-xl shadow-2xl">
            <AnimatePresence>
              {filteredOrders.length === 0 && searchTerm && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-gray-600"
                >
                  No orders found matching &quot;{searchTerm}&quot;.
                </motion.div>
              )}
              {filteredOrders.length === 0 && !searchTerm && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-gray-600"
                >
                  No {showCollected ? '' : 'pending'} orders to display.
                </motion.div>
              )}
            </AnimatePresence>
            {filteredOrders.length > 0 && (
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#1a3328] sm:pl-6">Order ID / Customer</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#1a3328]">Pickup Time</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#1a3328]">Drinks</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#1a3328]">Total</th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-[#1a3328]">Status</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-[#1a3328]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white/80">
                {filteredOrders.map((order) => (
                  <motion.tr 
                    key={order.id}
                    layout // Animate layout changes
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${order.is_collected ? 'bg-green-50/70' : ''} hover:bg-beige-light/30 transition-colors duration-150`}
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-[#1a3328]">{order.name}</div>
                        <div className="text-gray-600">{order.email}</div>
                        <div className="text-xs text-gray-400 mt-1">ID: {order.id.substring(0,8)}...</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{order.pickup_time}</td>
                    <td className="px-3 py-4 text-sm text-gray-700">
                      <ul className="list-disc list-inside space-y-1">
                        {order.drinks.map((drink, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-center">
                            <span className="mr-2 text-gray-500 font-medium">•</span>
                            <span>
                              {drink.quantity}x {drink.drink_name}
                              {(drink.oat_milk || drink.semi_skimmed_milk || drink.caramel_syrup || drink.vanilla_syrup || drink.is_decaf) && (
                                <span className="text-xs text-gray-500 ml-1">
                                  ({[drink.oat_milk && "Oat Milk", drink.semi_skimmed_milk && "Semi-Skimmed", drink.caramel_syrup && "Caramel", drink.vanilla_syrup && "Vanilla", drink.is_decaf && "Decaf"].filter(Boolean).join(", ")})
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 font-medium">£{order.total_price.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                        {order.is_collected ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                <CheckCircleIcon className="h-4 w-4 mr-1 text-green-600"/> In Kitchen
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                Pending
                            </span>
                        )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => triggerConfirmation(order.id, order.is_collected, order.name)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${order.is_collected ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 focus:ring-yellow-500' : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-600'}`}
                      >
                        {order.is_collected ? "Mark Pending" : "Add to Kitchen"}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && orderToConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md text-center"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-[#1a3328] mb-4">
                Confirm Action
              </h3>
              <p className="text-gray-700 mb-6 sm:text-base text-sm">
                Are you sure you want to {orderToConfirm.currentStatus ? "mark as Pending" : "add to Kitchen"} for <span className="font-medium">{orderToConfirm.customerName}</span>?
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={handleCancelStatusChange}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-white transition-colors duration-200 font-medium shadow-sm ${orderToConfirm.currentStatus ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 