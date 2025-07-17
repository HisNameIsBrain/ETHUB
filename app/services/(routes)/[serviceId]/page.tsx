"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

const EditServicePage = () => {
  const router = useRouter();
  const params = useParams();

  // Cast the serviceId string from params to Convex Id type for services
  const serviceId = params.serviceId as Id<"services">;

  const service = useQuery(api.services.getServiceById, { id: serviceId });
  const updateService = useMutation(api.services.updateService);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name ?? "",
        description: service.description ?? "",
        price: service.price ?? "",
      });
    }
  }, [service]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await updateService({
        id: serviceId,
        name: form.name,
        description: form.description,
        price: form.price,
      });
      toast.success("Service updated successfully");
      router.push("/services");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update service");
    } finally {
      setIsLoading(false);
    }
  };

  if (service === undefined) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (service === null) {
    return <div className="p-4 text-center text-red-500">Service not found.</div>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <Input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Service Name"
      />
      <Input
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
      />
      <Input
        name="price"
        value={form.price}
        onChange={handleChange}
        placeholder="Price"
      />
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Updating..." : "Update Service"}
      </Button>
    </div>
  );
};

export default EditServicePage;
