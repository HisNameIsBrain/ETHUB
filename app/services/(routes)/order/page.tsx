"use client";

import { useQuery } from "convex/react"; import { api } from "@/convex/_generated/api"; import { Spinner } from "@/components/spinner"; import BulkOrderInput from "@/components/orders/bulk-order-input";

export default function OrderPage() { const orders = useQuery(api.orders.getAll);

if (!orders) { return <Spinner />; }

return ( <div className="p-4"> <h1 className="text-xl font-bold mb-4">Bulk Orders</h1> <BulkOrderInput orders={orders} /> </div> ); }

