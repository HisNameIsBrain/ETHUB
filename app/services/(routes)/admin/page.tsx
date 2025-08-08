// app/admin/services/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // create this if not present
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminServicesPage() {
  const { user } = useUser();
  const services = useQuery(api.services.getPublic);
  const create = useMutation(api.services.create);
  const delete = useMutation(api.services.delete);
  
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
    
    await create({
      ...form,
      price: parseFloat(form.price),
    });
    
    setForm({ name: "", deliveryTime: "", price: "", description: "" });
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Service</CardTitle>
          <CardDescription>Enter service details to publish it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            placeholder="Delivery Time"
            value={form.deliveryTime}
            onChange={(e) => setForm((f) => ({ ...f, deliveryTime: e.target.value }))}
          />
          <Input
            placeholder="Price"
            value={form.price}
            type="number"
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
          <Textarea
            placeholder="Description (HTML or plain text)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Add Service</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Services</CardTitle>
          <CardDescription>Click delete to remove a service.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {services?.map((service) => (
            <Card key={service._id} className="border">
              <CardHeader>
                <CardTitle className="text-base">{service.name}</CardTitle>
                <CardDescription>
                  {service.deliveryTime} · ${service.price}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {service.description}
                </p>
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => delete({ serviceId: service._id })}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}