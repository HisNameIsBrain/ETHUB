'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { BulkOrderInput } from '@/components/orders/bulk-order-input';
import { Spinner } from '@/components/spinner';

export default function OrderPage() {
  const user = useQuery(api.users.getCurrentUser);
  
  if (user === undefined) {
    return (
      <div className="p-6">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Submit an Order</h1>

      {/* You can add <SingleOrderForm /> here in the future if needed */}
      <BulkOrderInput />
    </div>
  );
}
