'use client';

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";

interface PageProps {
  params: {
    serviceId: string;
  };
}

export default function EditServicePage({ params }: PageProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const service = useQuery(api.services.getById, {
    id: params.serviceId as any,
  });

  const updateService = useMutation(api.services.update);

  const [form, setForm] = useState({
    name: "",
    deliveryTime: "",
    price: "",
  });

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name,
        deliveryTime: service.deliveryTime,
        price: service.price,
      });
    }
  }, [service]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateService({
        id: params.serviceId as any,
        name: form.name,
        deliveryTime: form.deliveryTime,
        price: form.price,
      });
      router.push("/services");
    } catch (error) {
      console.error("Failed to update service:", error);
    }
  };

  if (!isLoaded) return <div className="p-6"><Spinner size="lg" /></div>;
  if (!isAdmin) return <div className="p-6 text-red-600">Unauthorized</div>;
  if (!service) return <div className="p-6"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Service</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Service Name</label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter service name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Delivery Time</label>
          <Input
            name="deliveryTime"
            value={form.deliveryTime}
            onChange={handleChange}
            placeholder="e.g. Instant, 1–2 min"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Price</label>
          <Input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="$0.00"
          />
        </div>
        <Button onClick={handleSubmit} className="w-full">
          Update Service
        </Button>
      </div>
    </div>
  );
}