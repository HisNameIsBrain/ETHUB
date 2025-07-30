// components/orders/bulk-order-input.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

export function BulkOrderInput() {
  const [bulkData, setBulkData] = useState("");
  const createOrder = useMutation(api.orders.createOrder); // Adjust path accordingly

  const handleSubmit = async () => {
    const lines = bulkData
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    try {
      await Promise.all(
        lines.map(async (entry) => {
          const [imei, serviceType, price] = entry.split(",").map((s) => s.trim());

          if (!imei || !serviceType || !price) return;

          await createOrder({
            imei,
            serviceType,
            price: parseFloat(price),
          });
        })
      );
      toast.success("Bulk orders created!");
      setBulkData("");
    } catch (err) {
      toast.error("Something went wrong.");
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <h2 className="text-lg font-semibold">Bulk Order Input</h2>
      <Textarea
        placeholder="Paste lines like: IMEI, Service, Price"
        rows={8}
        value={bulkData}
        onChange={(e) => setBulkData(e.target.value)}
      />
      <Button onClick={handleSubmit}>Submit Bulk Orders</Button>
    </div>
  );
}