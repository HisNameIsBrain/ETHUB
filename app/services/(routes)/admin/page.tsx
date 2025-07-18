"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AdminServicesPage() {
  const { user } = useUser();
  const services = useQuery(api.services.getPublicServices);
  const createService = useMutation(api.services.createService);
  const deleteService = useMutation(api.services.deleteService);
  
  const [form, setForm] = useState({
    name: "",
    deliveryTime: "",
    price: "",
    description: "",
  });
  
  const [bulkInput, setBulkInput] = useState("");
  
  const handleSubmit = async () => {
    const { name, deliveryTime, price, description } = form;
    if (!name || !deliveryTime || !price || !description) {
      alert("Please fill in all fields.");
      return;
    }
    
    await createService({ ...form, price: parseFloat(price) });
    setForm({ name: "", deliveryTime: "", price: "", description: "" });
  };
  
  const handleBulkAdd = async () => {
    const lines = bulkInput.split("\n").filter(Boolean);
    
    for (const line of lines) {
      const [name, deliveryTime, price, ...desc] = line.split(",");
      const description = desc.join(",").trim();
      
      if (name && deliveryTime && price && description) {
        await createService({
          name: name.trim(),
          deliveryTime: deliveryTime.trim(),
          price: parseFloat(price),
          description,
        });
      }
    }
    
    setBulkInput("");
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-semibold">Add New Service</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Delivery Time"
          value={form.deliveryTime}
          onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
        />
        <Input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <Textarea
          placeholder="Description"
          value={form.description}
          className="col-span-1 sm:col-span-2"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <Button onClick={handleSubmit}>Add Service</Button>

      <Separator className="my-8" />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Bulk Add Services</h2>
        <Textarea
          placeholder="Paste services like: Name,Delivery Time,Price,Description"
          className="min-h-[120px]"
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
        />
        <Button variant="secondary" onClick={handleBulkAdd}>
          Bulk Add
        </Button>
      </div>

      <Separator className="my-8" />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Existing Services</h2>
        <div className="grid gap-4">
          {services?.map((service) => (
            <Card key={service._id}>
              <CardContent className="p-4 space-y-1">
                <div className="font-bold">{service.name}</div>
                <div className="text-muted-foreground text-sm">
                  Delivery: {service.deliveryTime}
                </div>
                <div className="text-sm">Price: ${service.price}</div>
                <div className="text-sm text-gray-600 whitespace-pre-line">
                  {service.description}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteService({ serviceId: service._id })}
                  className="mt-2"
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}