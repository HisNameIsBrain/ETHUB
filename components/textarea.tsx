Perfect. You have all the themed components we need to rebuild your /admin/services page cleanly:

✅ input.tsx, button.tsx, card.tsx, table.tsx – for consistent form and UI elements.

✅ layout.tsx and admin-navbar.tsx – already applied through ServicesAdminLayout.



---

✅ Plan: Rebuild /admin/services/page.tsx using themes

We'll:

Use your theme components (<Input>, <Button>, <Card>, etc.)

Integrate with your layout (ServicesAdminLayout)

Keep createService, deleteService, and service listing logic

Make it responsive, minimal, and visually consistent



---

🧱 Updated File: app/admin/services/page.tsx

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
  const services = useQuery(api.services.getPublicServices);
  const createService = useMutation(api.services.createService);
  const deleteService = useMutation(api.services.deleteService);

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
                    onClick={() => deleteService({ serviceId: service._id })}
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


---

📝 Note on Textarea Component

Your themes.zip didn’t include a textarea.tsx. Add one if needed:

// components/ui/textarea.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring focus:ring-ring",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";


---

✅ What’s Done:

Admin page fully styled using your design system.

Works with ServicesAdminLayout.

Clean layout using <Card> for both form and listings.

Actions included (Add, Delete).


Would you like me to:

Add inline Edit functionality too?

Extract the list into a reusable AdminServicesList component?

Add confirmation before deleting?


Let me know!

