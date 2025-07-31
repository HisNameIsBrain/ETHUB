// app/admin/services/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function AdminServicesPage() {
  const { user } = useUser();
  const services = useQuery(api.services.getPublicServices);
  const createService = useMutation(api.services.createService);
  const deleteService = useMutation(api.services.deleteService);
  const updateService = useMutation(api.services.updateService);
  
  const [form, setForm] = useState({
    name: "",
    deliveryTime: "",
    price: "",
    description: "",
  });
  
  const handleSubmit = async () => {
    if (!form.name || !form.deliveryTime || !form.price || !form.description) {
      alert("Please fill out all fields.");
      return;
    }
    
    await createService({
      ...form,
      price: parseFloat(form.price),
    });
    
    setForm({ name: "", deliveryTime: "", price: "", description: "" });
  };
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Add New Service</h2>
      <div className="grid gap-2 mb-6">
        <input
          className="border px-2 py-1 rounded"
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          className="border px-2 py-1 rounded"
          type="text"
          placeholder="Delivery Time"
          value={form.deliveryTime}
          onChange={(e) => setForm((f) => ({ ...f, deliveryTime: e.target.value }))}
        />
        <input
          className="border px-2 py-1 rounded"
          type="text"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
        />
        <textarea
          className="border px-2 py-1 rounded"
          placeholder="Description (HTML)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <div className="text-sm text-gray-600">Delivery: {form.deliveryTime}</div>
        <div className="text-sm text-gray-600">Price: ${form.price}</div>
        <div className="text-sm text-gray-600 whitespace-pre-line">{form.description}</div>
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Service
        </button>
      </div>

      <h2 className="text-lg font-bold mb-4">Existing Services</h2>
      {services?.map((service) => (
        <div key={service._id} className="border p-3 mb-3 rounded">
          <div className="font-semibold">{service.name}</div>
          <div className="text-sm text-gray-600">Delivery: {service.deliveryTime}</div>
          <div className="text-sm text-gray-600">Price: ${service.price}</div>
          <div className="text-sm text-gray-600 whitespace-pre-line">{service.description}</div>
          <button
            onClick={() => deleteService({ serviceId: service._id })}
            className="text-red-500 mt-2"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}