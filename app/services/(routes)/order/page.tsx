import { BulkOrderInput } from "@/components/orders/bulk-order-input";

export default function OrderPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Submit an Order</h1>

      {/* Single Order Form Here */}

      <BulkOrderInput />
    </div>
  );
}
