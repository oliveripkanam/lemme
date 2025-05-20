"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { ListBulletIcon, CheckCircleIcon, ClockIcon, EyeIcon, TagIcon, UserCircleIcon, CubeIcon, CurrencyPoundIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

// Types (can be shared or adapted from other pages)
interface OrderItemCustomizations {
  hasOatMilk: boolean;
  syrups: { caramel: boolean; vanilla: boolean; };
  hasSemiSkimmedMilk: boolean;
  isDecaf: boolean;
  isIced: boolean;
}

interface ArchivedOrderItem {
  id: string;
  drink_name: string;
  quantity: number;
  customizations: OrderItemCustomizations;
  calculated_unit_price: number;
  status: "pending" | "completed";
}

interface ArchivedOrder {
  id: string; // live_orders.id
  created_at: string;
  customer_name: string | null;
  total_amount: number;
  status: "pending" | "completed" | "archived"; // Status of the overall order
  live_order_items: ArchivedOrderItem[];
}

// Raw query result type
interface ArchivedOrderQueryResult extends Omit<ArchivedOrder, 'live_order_items'> {
  live_order_items: {
    id: string;
    drink_name: string;
    quantity: number;
    customizations: any; // Parse this
    calculated_unit_price: number;
    status: "pending" | "completed";
  }[];
}

export default function OrderArchivePage() {
  const [orders, setOrders] = useState<ArchivedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"completed" | "pending">("completed"); // Default to showing completed
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null); // For loading state

  const parseItemCustomizations = (customizations: any): OrderItemCustomizations => {
    const defaults: OrderItemCustomizations = {
      hasOatMilk: false,
      syrups: { caramel: false, vanilla: false },
      hasSemiSkimmedMilk: true,
      isDecaf: false,
      isIced: false,
    };
    if (typeof customizations !== 'object' || customizations === null) return defaults;
    return {
      hasOatMilk: typeof customizations.hasOatMilk === 'boolean' ? customizations.hasOatMilk : defaults.hasOatMilk,
      syrups: {
        caramel: typeof customizations.syrups?.caramel === 'boolean' ? customizations.syrups.caramel : defaults.syrups.caramel,
        vanilla: typeof customizations.syrups?.vanilla === 'boolean' ? customizations.syrups.vanilla : defaults.syrups.vanilla,
      },
      hasSemiSkimmedMilk: typeof customizations.hasSemiSkimmedMilk === 'boolean' ? customizations.hasSemiSkimmedMilk : defaults.hasSemiSkimmedMilk,
      isDecaf: typeof customizations.isDecaf === 'boolean' ? customizations.isDecaf : defaults.isDecaf,
      isIced: typeof customizations.isIced === 'boolean' ? customizations.isIced : defaults.isIced,
    };
  };

  const fetchOrders = useCallback(async (statusToShow: "pending" | "completed") => {
    setIsLoading(true);
    setError(null);
    console.log(`[Archive] Fetching orders with status: ${statusToShow}`);
    try {
      const { data, error: fetchError } = await supabase
        .from("live_orders")
        .select(`
          id,
          created_at,
          customer_name,
          total_amount,
          status,
          live_order_items (id, drink_name, quantity, customizations, calculated_unit_price, status)
        `)
        .eq("status", statusToShow)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      console.log(`[Archive] Raw data for ${statusToShow} orders:`, data);

      const mappedOrders: ArchivedOrder[] = data?.map((order: ArchivedOrderQueryResult) => ({
        ...order,
        live_order_items: order.live_order_items.map(item => ({
          ...item,
          customizations: parseItemCustomizations(item.customizations),
        })),
      })) || [];
      
      setOrders(mappedOrders);
    } catch (err: any) {
      console.error(`[Archive] Error fetching ${statusToShow} orders:`, err);
      setError(`Failed to fetch orders: ${err.message}`);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(filterStatus);
  }, [filterStatus, fetchOrders]);
  
  // Real-time subscription for new completed orders or status changes
  useEffect(() => {
    const ordersChannel = supabase
      .channel('custom-live-orders-archive-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_orders' },
        (payload) => {
          console.log('[Archive] Real-time live_orders change:', payload);
          // Refetch if the changed order matches current filter, or if a new one is inserted matching filter
          const changedOrder = payload.new as ArchivedOrder;
          if (changedOrder && changedOrder.status === filterStatus) {
             fetchOrders(filterStatus);
          } else if (payload.eventType === 'UPDATE') {
            const oldOrder = payload.old as ArchivedOrder;
            // If status changed TO the current filter from something else
            if (oldOrder && oldOrder.status !== filterStatus && changedOrder && changedOrder.status === filterStatus) {
                fetchOrders(filterStatus);
            }
            // If status changed FROM current filter TO something else
            else if (oldOrder && oldOrder.status === filterStatus && changedOrder && changedOrder.status !== filterStatus) {
                fetchOrders(filterStatus); // To remove it from the current view
            }
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Archive] Subscribed to live_orders changes!');
        } else {
          console.error('[Archive] Subscription error:', err);
        }
      });

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [filterStatus, fetchOrders]);

  const handleMarkAsPending = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    setError(null);
    try {
      // Update all items in the order to 'pending'
      const { error: itemsError } = await supabase
        .from("live_order_items")
        .update({ status: "pending" })
        .eq("live_order_id", orderId);

      if (itemsError) throw itemsError;

      // Update the parent order to 'pending'
      const { error: orderError } = await supabase
        .from("live_orders")
        .update({ status: "pending" })
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Refetch orders to update the UI (or locally remove the order from this list)
      // For simplicity, refetching based on current filter.
      // If current filter is 'completed', this order will disappear.
      // If somehow current filter was 'pending', it would appear.
      fetchOrders(filterStatus);
      console.log(`[Archive] Order ${orderId} marked back to pending.`);

    } catch (err: any) {
      console.error(`[Archive] Error marking order ${orderId} as pending:`, err);
      setError(`Failed to revert order ${orderId}: ${err.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  };

  const renderCustomizations = (customizations: OrderItemCustomizations) => {
    const c: string[] = [];
    if (customizations.isIced) c.push("Iced");
    if (customizations.hasOatMilk) c.push("Oat Milk");
    if (customizations.syrups.caramel) c.push("Caramel Syrup");
    if (customizations.syrups.vanilla) c.push("Vanilla Syrup");
    if (!customizations.hasSemiSkimmedMilk && !customizations.hasOatMilk) c.push("No Milk"); // Assuming oat implies no semi
    else if (!customizations.hasSemiSkimmedMilk && customizations.hasOatMilk) {} // Already covered by Oat
    else if (customizations.hasSemiSkimmedMilk && !customizations.hasOatMilk && c.length === 0 && !customizations.isDecaf && Object.values(customizations.syrups).every(s => !s) ) {} // Default milk, no other options
    else if (customizations.hasSemiSkimmedMilk) c.push("Semi-Skimmed");


    if (customizations.isDecaf) c.push("Decaf");
    return c.length > 0 ? c.join(', ') : "Standard";
  };
  

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <header className="mb-6 sm:mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400">Completed Live Orders</h1>
            <div className="flex items-center space-x-2">
                <Link href="/admin" className="bg-gray-700 hover:bg-gray-600 text-yellow-300 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Admin Home
                </Link>
                 <Link href="/admin/kitchen" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Kitchen View
                </Link>
            </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-end">
          <div className="flex space-x-1 bg-slate-700 p-1 rounded-lg">
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors
                ${filterStatus === "completed" ? "bg-green-600 text-white shadow-md" : "text-gray-300 hover:bg-slate-600"}`}
            >
              <CheckCircleIcon className="h-5 w-5 inline mr-1.5 mb-0.5" />
              Completed
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors
                ${filterStatus === "pending" ? "bg-amber-500 text-white shadow-md" : "text-gray-300 hover:bg-slate-600"}`}
            >
              <ClockIcon className="h-5 w-5 inline mr-1.5 mb-0.5" />
              Pending
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-10">
            <CubeIcon className="h-12 w-12 text-gray-500 animate-spin mx-auto mb-3" />
            <p className="text-xl text-gray-400">Loading orders...</p>
          </div>
        )}
        {error && <p className="text-center text-red-400 bg-red-900/30 p-3 rounded-md">Error: {error}</p>}
        
        {!isLoading && !error && orders.length === 0 && (
          <div className="text-center py-10 bg-slate-800 shadow-sm rounded-lg p-8">
            <EyeIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-2xl text-gray-400 font-semibold">No {filterStatus} orders found.</p>
            <p className="text-gray-500 mt-1">Try changing the filter or wait for new orders.</p>
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(order => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-800 shadow-lg rounded-xl overflow-hidden"
              >
                <div className="p-4 sm:p-5 border-b border-slate-700 bg-slate-700/50">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h2 className="text-lg font-semibold text-sky-400 flex items-center">
                        <TagIcon className="h-5 w-5 mr-2 text-sky-500"/>
                        Order ID: <span className="text-gray-300 ml-1">{order.id.substring(0,8)}...</span>
                      </h2>
                      {order.customer_name && (
                        <p className="text-sm text-gray-400 mt-0.5 flex items-center">
                          <UserCircleIcon className="h-4 w-4 mr-1.5 text-gray-500"/>
                          Customer: <span className="font-medium ml-1 text-gray-300">{order.customer_name}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 sm:text-right">
                        <p className="flex items-center sm:justify-end"> 
                            <ClockIcon className="h-4 w-4 mr-1.5"/> Ordered: {formatTimestamp(order.created_at)}
                        </p>
                        <p className={`mt-0.5 font-semibold flex items-center sm:justify-end ${order.status === 'completed' ? 'text-green-400' : 'text-amber-400'}`}>
                           {order.status === 'completed' ? <CheckCircleIcon className="h-4 w-4 mr-1.5"/> : <ClockIcon className="h-4 w-4 mr-1.5"/>}
                           Status: <span className="capitalize ml-1">{order.status}</span>
                        </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <ul className="space-y-2.5 mb-3">
                    {order.live_order_items.map(item => (
                      <li key={item.id} className="flex justify-between items-start text-sm p-2 bg-slate-700/60 rounded-md">
                        <div>
                          <span className="font-medium text-sky-300">{item.quantity}x {item.drink_name}</span>
                          <span className="text-xs text-gray-400 ml-2">(£{item.calculated_unit_price.toFixed(2)} each)</span>
                          <p className="text-xs text-gray-400 pl-1">↳ Customizations: {renderCustomizations(item.customizations)}</p>
                           <p className={`text-xs pl-1 ${item.status === 'completed' ? 'text-green-400' : 'text-orange-400'}`}>Item Status: {item.status}</p>
                        </div>
                        <p className="font-semibold text-gray-200">£{(item.quantity * item.calculated_unit_price).toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                     <p className="text-md font-bold text-sky-400 flex items-center">
                        <CurrencyPoundIcon className="h-5 w-5 mr-1 text-sky-500"/>
                        Order Total: £{order.total_amount.toFixed(2)}
                    </p>
                    {order.status === 'completed' && filterStatus === 'completed' && (
                        <button 
                            onClick={() => handleMarkAsPending(order.id)}
                            disabled={updatingOrderId === order.id}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-3 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <ArrowUturnLeftIcon className="h-4 w-4 mr-1.5" />
                            {updatingOrderId === order.id ? "Reverting..." : "Mark as Pending"}
                        </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 