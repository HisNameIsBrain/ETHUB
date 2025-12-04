"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function NewServicePage() {
  const router = useRouter();
  const createService = useMutation(api.services.create);
  const [name, setName] = useState("");

  const onSubmit = async () => {
    if (!name.trim()) return;
    const promise = createService({ name, description: "", price: 0 });
    toast.promise(promise, {
      loading: "Creating service...",
      success: () => {
        router.push("/dashboard/services");
        return "Service created!";
      },
      error: "Failed to create service.",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">New Service</h1>
      <Card className="p-4 space-y-3">
        <Input
          placeholder="Service name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={onSubmit}>Create Service</Button>
      </Card>
    </div>
  );
}
