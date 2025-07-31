"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/spinner";
impor

export default function OrdersPage() {
  const orders = useQuery(api.orders.getAll);
  
  if (!orders) {
    return <Spinner />;
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300 rounded-md">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">IMEI</th>
              <th className="px-4 py-2 border">Serial</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Notes</th>
              <th className="px-4 py-2 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order._id} className="border-t">
                <td className="px-4 py-2 border">{index + 1}</td>
                <td className="px-4 py-2 border">
                  {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm:ss")}
                </td>
                <td className="px-4 py-2 border">{order.imei}</td>
                <td className="px-4 py-2 border">{order.serial || "-"}</td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      order.status === "Rejected"
                        ? "bg-red-500"
                        : order.status === "Success"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-2 border">
                  {order.notes || <span className="text-gray-400">–</span>}
                </td>
                <td className="px-4 py-2 border text-center">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                    View
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}