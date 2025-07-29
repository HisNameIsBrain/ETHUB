"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BulkOrderInput } from "@/components/orders/bulk-order-input";
import { Spinner } from "@/components/spinner";

export default function OrderPage() {
  const user = useQuery(api.users.getCurrentUser);
  
  if (user === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (user === null) {
    return (
      <div className="flex justify-center items-center h-screen text-muted-foreground">
        You must be signed in to place an order.
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Submit an Order</h1>

      {/* Add additional order forms here if needed */}
      <BulkOrderInput />
    </div>
  );
}