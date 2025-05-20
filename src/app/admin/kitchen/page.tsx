"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { EyeIcon, CheckCircleIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon, ArchiveBoxIcon, FolderOpenIcon, BuildingStorefrontIcon, ArrowUturnDownIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link'; // Added Link for navigation

// Costs for modifications - for display consistency
const OAT_MILK_COST = 0.40;
const SYRUP_COST = 0.40;

// Corrected interface to match cashier page
interface OrderItemCustomizations {
  hasOatMilk: boolean;
  syrups: {
    caramel: boolean;
    vanilla: boolean;
  };
  hasSemiSkimmedMilk: boolean;
  isDecaf: boolean;
  isIced: boolean;
}

interface LiveOrderItem {
  id: string; // item id
  live_order_id: string; // parent order id
  drink_id: string;
  drink_name: string;
  quantity: number;
  customizations: OrderItemCustomizations;
  calculated_unit_price: number;
  status: "pending" | "completed";
  live_orders: {
    created_at: string;
    customer_name?: string;
    total_amount?: number;
    status?: "pending" | "completed" | "archived"; // Added parent order status
  } | null;
  created_at?: string; // Item creation time
}

interface LiveOrderItemQueryResult extends Omit<LiveOrderItem, 'live_orders' | 'customizations'> {
  customizations: unknown;
  live_orders: {
    created_at: string;
    customer_name?: string;
    total_amount?: number;
    status?: "pending" | "completed" | "archived";
  } | null;
}

interface GroupedLiveOrder {
  live_order_id: string;
  customer_name: string;
  order_created_at: string;
  items: LiveOrderItem[];
  isExpanded?: boolean;
  status: "pending" | "completed" | "archived"; // Status of the parent order
}


export default function KitchenPage() {
  const [pendingOrders, setPendingOrders] = useState<GroupedLiveOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const parseCustomizations = (customizations: unknown): OrderItemCustomizations => {
    const defaults: OrderItemCustomizations = {
      hasOatMilk: false,
      syrups: { caramel: false, vanilla: false },
      hasSemiSkimmedMilk: true,
      isDecaf: false,
      isIced: false,
    };

    // Check if customizations is an object and not null
    if (typeof customizations === 'object' && customizations !== null) {
      const c = customizations as Partial<OrderItemCustomizations>; // Type assertion
      return {
        hasOatMilk: typeof c.hasOatMilk === 'boolean' ? c.hasOatMilk : defaults.hasOatMilk,
        syrups: {
          caramel: typeof c.syrups?.caramel === 'boolean' ? c.syrups.caramel : defaults.syrups.caramel,
          vanilla: typeof c.syrups?.vanilla === 'boolean' ? c.syrups.vanilla : defaults.syrups.vanilla,
        },
        hasSemiSkimmedMilk: typeof c.hasSemiSkimmedMilk === 'boolean' ? c.hasSemiSkimmedMilk : defaults.hasSemiSkimmedMilk,
        isDecaf: typeof c.isDecaf === 'boolean' ? c.isDecaf : defaults.isDecaf,
        isIced: typeof c.isIced === 'boolean' ? c.isIced : defaults.isIced,
      };
    }
    return defaults; // Return defaults if customizations is not a valid object
  };

  const groupAndFilterOrders = useCallback((items: LiveOrderItem[]): GroupedLiveOrder[] => {
    const grouped: Record<string, GroupedLiveOrder> = {};
    items.forEach(item => {
      // Only process items belonging to a 'pending' parent order for the kitchen queue
      if (item.live_orders?.status !== 'pending') {
        return;
      }
      const orderId = item.live_order_id;
      if (!grouped[orderId]) {
        grouped[orderId] = {
          live_order_id: orderId,
          customer_name: item.live_orders?.customer_name || "Guest",
          order_created_at: item.live_orders?.created_at || item.created_at || new Date().toISOString(),
          items: [],
          isExpanded: pendingOrders.find(po => po.live_order_id === orderId)?.isExpanded || false, // Preserve expansion state
          status: item.live_orders?.status || 'pending',
        };
      }
      grouped[orderId].items.push(item);
      grouped[orderId].items.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
    });
    const result = Object.values(grouped).filter(group => group.status === 'pending'); // Ensure only pending orders are shown
    result.sort((a, b) => new Date(a.order_created_at).getTime() - new Date(b.order_created_at).getTime());
    return result;
  }, [pendingOrders]);

  const fetchPendingOrders = useCallback(async () => {
    setIsLoading(true);
    console.log("[Kitchen] Fetching pending orders...");
    try {
      const { data: rawData, error: fetchError } = await supabase
        .from("live_order_items")
        .select(`
          id,
          live_order_id,
          drink_id,
          drink_name,
          quantity,
          customizations,
          calculated_unit_price,
          status,
          created_at,
          live_orders ( created_at, total_amount, customer_name, status ) 
        `)
        .order("created_at", { referencedTable: "live_orders", ascending: true })
        .order("created_at", { ascending: true });

      console.log("[Kitchen] Raw data from Supabase:", JSON.stringify(rawData, null, 2));

      if (fetchError) throw fetchError;
      
      const processedItems: LiveOrderItem[] = rawData?.map(itemQueryResult => {
        const item = itemQueryResult as any; // Broaden type here to handle potential mismatch below
        return {
          ...item,
          customizations: parseCustomizations(item.customizations),
          // Assign live_orders, trusting runtime structure is object or null
          live_orders: item.live_orders as (LiveOrderItemQueryResult['live_orders']) // Cast to the target type
        };
      }) || [];
      
      console.log("[Kitchen] Processed items before grouping:", JSON.stringify(processedItems, null, 2));

      const grouped = groupAndFilterOrders(processedItems);
      console.log("[Kitchen] Grouped and filtered orders for display:", JSON.stringify(grouped, null, 2));
      setPendingOrders(grouped);
      setError(null);
    } catch (err: unknown) {
      console.error("[Kitchen] Error fetching pending orders:", err);
      let message = 'Failed to fetch orders';
      if (err instanceof Error) {
        message = `Failed to fetch orders: ${err.message}`;
      }
      setError(message);
      setPendingOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [groupAndFilterOrders]);

  useEffect(() => {
    fetchPendingOrders();

    const channel = supabase
      .channel("live_order_items_kitchen_changes_v2")
      .on<LiveOrderItemQueryResult>(
        "postgres_changes",
        {
          event: "*", 
          schema: "public",
          table: "live_order_items",
        },
        async (payload) => {
          console.log("[Kitchen] Real-time event payload:", JSON.stringify(payload, null, 2));
          console.log("[Kitchen] Re-fetching all orders due to real-time event.");
          await fetchPendingOrders();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Kitchen] Subscribed to live_order_items changes (kitchen v2)!');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[Kitchen] Subscription error or timed out (kitchen v2):', err);
          setError('Real-time connection error. Please refresh.');
        }
      });

    return () => {
      console.log("[Kitchen] Removing channel subscription.");
      supabase.removeChannel(channel);
    };
  }, [fetchPendingOrders]);

  const formatOrderTime = (timestamp: string | undefined) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleToggleOrderItemStatus = async (orderId: string, itemId: string, currentStatus: "pending" | "completed") => {
    setUpdatingItemId(itemId);
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      const { error: updateError } = await supabase
        .from("live_order_items")
        .update({ status: newStatus })
        .eq("id", itemId)
        .select() 
        .single();

      if (updateError) throw updateError;

      // Update local state to reflect change immediately
      setPendingOrders(prevOrders => prevOrders.map(order => {
        if (order.live_order_id === orderId) {
          return {
            ...order,
            items: order.items.map(item => 
              item.id === itemId ? { ...item, status: newStatus } : item
            )
          };
        }
        return order;
      // No longer filtering out orders here, as an item marked back to pending should keep the order visible if it was already visible.
      // Filtering for parent order status happens in groupAndFilterOrders.
      })); 
      
      console.log(`Item ${itemId} status changed to ${newStatus}.`);
    } catch (err: unknown) {
      console.error(`Error toggling item ${itemId} status to ${newStatus}:`, err);
      let message = `Failed to update item ${itemId}`;
      if (err instanceof Error) {
        message = `Failed to update item ${itemId}: ${err.message}`;
      }
      setError(message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleMarkEntireOrderAsCompletedAndArchive = async (orderIdToComplete: string) => {
    setUpdatingOrderId(orderIdToComplete);
    try {
      const orderToUpdate = pendingOrders.find(order => order.live_order_id === orderIdToComplete);
      if (!orderToUpdate) {
        console.warn(`[Kitchen] Order ${orderIdToComplete} not found in local state for archiving.`);
        return;
      }

      // 1. Mark all PENDING items in this order as 'completed' (idempotent)
      const pendingItemIdsInOrder = orderToUpdate.items
        .filter(item => item.status === 'pending')
        .map(item => item.id);

      if (pendingItemIdsInOrder.length > 0) {
        const { error: itemsUpdateError } = await supabase
          .from("live_order_items")
          .update({ status: "completed" })
          .in("id", pendingItemIdsInOrder);
        if (itemsUpdateError) throw itemsUpdateError;
        console.log(`[Kitchen] Marked ${pendingItemIdsInOrder.length} pending items in order ${orderIdToComplete} as completed.`);
      } else {
        console.log(`[Kitchen] No pending items to mark in order ${orderIdToComplete}. Proceeding to archive parent order.`);
      }

      // 2. Mark the parent live_orders record as 'completed' 
      // This signifies it's done from the kitchen's perspective and ready for the archive/management page.
      const { error: orderUpdateError } = await supabase
        .from("live_orders")
        .update({ status: "completed" }) 
        .eq("id", orderIdToComplete);

      if (orderUpdateError) throw orderUpdateError;
      
      console.log(`[Kitchen] Parent Order ${orderIdToComplete} status updated to 'completed'.`);
      
      // Remove the order from the Kitchen Page UI immediately as it's no longer for the kitchen queue
      setPendingOrders(prev => prev.filter(o => o.live_order_id !== orderIdToComplete));
      
      // console.log(`[Kitchen] Navigating to order archive for order: ${orderIdToComplete}`);
      // router.push('/admin/order-archive'); // REMOVED THIS LINE

    } catch (err: unknown) {
      console.error(`[Kitchen] Error marking order ${orderIdToComplete} as completed & ready for archive:`, err);
      let message = `Failed to process order ${orderIdToComplete}`;
      if (err instanceof Error) {
        message = `Failed to process order ${orderIdToComplete}: ${err.message}`;
      }
      setError(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };
  
  const toggleOrderExpansion = (orderIdToToggle: string) => {
    setPendingOrders(prevOrders =>
      prevOrders.map(order =>
        order.live_order_id === orderIdToToggle
          ? { ...order, isExpanded: !order.isExpanded }
          : order
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-2xl animate-pulse">Loading Kitchen Orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <header className="mb-8 ">
        <div className="flex justify-between items-center mb-4 max-w-5xl mx-auto">
          <Link href="/admin/cashier" className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
            <BuildingStorefrontIcon className="h-5 w-5 mr-2"/>
            Cashier UI
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 tracking-wider text-center flex-grow">DRINK MAKER QUEUE</h1>
          <div className="flex space-x-2"> {/* Added a div to wrap the admin home and completed orders buttons */}
            <Link href="/admin" className="bg-gray-700 hover:bg-gray-600 text-yellow-300 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                 Admin Home
            </Link>
            <Link href="/admin/order-archive" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
              <FolderOpenIcon className="h-5 w-5 mr-2"/>
              Completed Orders
            </Link>
          </div>
        </div>
        {error && <p className="text-red-400 mt-2 text-lg text-center">Error: {error}</p>}
      </header>

      {pendingOrders.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <EyeIcon className="h-24 w-24 text-gray-500 mb-4" />
          <p className="text-2xl text-gray-400">No pending orders right now.</p>
          <p className="text-gray-500">Kitchen is clear! New orders will appear automatically.</p>
        </div>
      )}

      <AnimatePresence>
        <motion.div className="space-y-6 max-w-5xl mx-auto">
          {pendingOrders.map((order) => (
            <motion.div
              key={order.live_order_id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden"
            >
              <div 
                className="p-4 sm:p-5 flex justify-between items-center cursor-pointer hover:bg-slate-700/70 transition-colors"
                onClick={() => toggleOrderExpansion(order.live_order_id)}
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-yellow-500">
                    Order for: <span className="text-yellow-300">{order.customer_name}</span>
                  </h2>
                  <p className="text-xs text-gray-400 flex items-center mt-1">
                    <ClockIcon className="h-4 w-4 mr-1.5 text-gray-500"/>
                    Ordered at: {formatOrderTime(order.order_created_at)}
                    <span className="mx-2">|</span> 
                    ID: {order.live_order_id.substring(0,8)}...
                  </p>
                </div>
                <div className="flex items-center">
                    <span className="mr-3 text-sm text-gray-300 bg-slate-700 px-2 py-1 rounded-md">
                        {order.items.filter(i => i.status === 'pending').length} pending
                    </span>
                    {order.isExpanded ? <ChevronUpIcon className="h-6 w-6 text-gray-400"/> : <ChevronDownIcon className="h-6 w-6 text-gray-400"/>}
                </div>
              </div>

              <AnimatePresence>
                {order.isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-slate-800/50"
                  >
                    <div className="p-3 sm:p-4 border-t border-slate-700 space-y-3">
                      {order.items.map(item => (
                        <motion.div 
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`p-3 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${item.status === 'completed' ? 'bg-slate-600/50 opacity-70' : 'bg-slate-700/60'}`}
                        >
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                                <h3 className={`text-lg font-medium ${item.status === 'completed' ? 'text-sky-300/70 line-through' : 'text-sky-400'}`}>{item.drink_name}</h3>
                                {item.status === 'completed' && <span className="ml-2 text-xs font-semibold text-green-400 bg-green-900/50 px-2 py-0.5 rounded">DONE</span>}
                            </div>
                            
                            <p className="text-xs text-gray-400/80 mt-0.5">Item ID: {item.id.substring(0,8)}...</p>
                            
                            {(item.customizations.hasOatMilk || item.customizations.syrups.caramel || item.customizations.syrups.vanilla || item.customizations.isDecaf || item.customizations.isIced || !item.customizations.hasSemiSkimmedMilk) && (
                              <div className="mt-1.5 text-xs">
                                <strong className="text-gray-300/90">Customizations:</strong>
                                <ul className="list-disc list-inside ml-1 text-gray-400/90">
                                  {item.customizations.hasOatMilk && <li>Oat Milk (+£{OAT_MILK_COST.toFixed(2)})</li>}
                                  {item.customizations.syrups.caramel && <li>Caramel Syrup (+£{SYRUP_COST.toFixed(2)})</li>}
                                  {item.customizations.syrups.vanilla && <li>Vanilla Syrup (+£{SYRUP_COST.toFixed(2)})</li>}
                                  {!item.customizations.hasSemiSkimmedMilk && <li className={item.status === 'completed' ? 'line-through' : ''}>No Semi-Skimmed Milk</li>}
                                  {item.customizations.isDecaf && <li className={item.status === 'completed' ? 'line-through' : ''}>Decaf</li>}
                                  {item.customizations.isIced && <li className={item.status === 'completed' ? 'line-through' : ''}>Iced</li>}
                                </ul>
                              </div>
                            )}
                          </div>
                          {/* Container for quantity and button to ensure alignment */}
                          <div className="flex items-center space-x-3 sm:space-x-4 mt-2 sm:mt-0 flex-shrink-0">
                            <span className={`text-lg font-semibold ${item.status === 'completed' ? 'text-sky-300/70' : 'text-sky-300'}`}>x{item.quantity}</span>
                            <button
                              onClick={() => handleToggleOrderItemStatus(order.live_order_id, item.id, item.status)}
                              disabled={updatingItemId === item.id}
                              className={`w-full sm:w-auto text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm whitespace-nowrap 
                                ${item.status === 'completed' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                              {item.status === 'completed' ? 
                                <ArrowUturnDownIcon className="h-5 w-5 mr-2"/> : 
                                <CheckCircleIcon className="h-5 w-5 mr-2"/>
                              }
                              {item.status === 'completed' ? (updatingItemId === item.id ? "Undoing..." : "Undo Done") : (updatingItemId === item.id ? "Completing..." : "Mark Drink Done")}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Button to mark entire order as completed and navigate */}
                      {/* This button should be visible as long as the order itself is in the kitchen queue (i.e., parent order status is pending) */}
                      {/* The action will mark items and parent order, then navigate. */}
                      {order.status === 'pending' && (
                        <button
                            onClick={() => handleMarkEntireOrderAsCompletedAndArchive(order.live_order_id)}
                            disabled={updatingOrderId === order.live_order_id}
                            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <ArchiveBoxIcon className="h-5 w-5 mr-2.5"/>
                            {updatingOrderId === order.live_order_id ? "Processing..." : "Mark Entire Order Ready & Archive"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 