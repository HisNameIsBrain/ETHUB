"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const ServicesAdminPage = () => {
  const { user } = useUser();
  const router = useRouter();

  const create = useMutation(api.services.createService);
  const remove = useMutation(api.services.removeService);
  const update = useMutation(api.services.updateService);
  const services = useQuery(api.services.getAll);

  const handleCreateService = () => {
    const promise = create({ name: "New Service", description: "Service Description" }).then(
      (serviceId) => router.push(`/services/${serviceId}`)
    );

    toast.promise(promise, {
      loading: "Creating a new service...",
      success: "New service created!",
      error: "Failed to create a new service.",
    });
  };

  const handleUpdateService = (serviceId: string) => {
    const promise = update({
      id: serviceId,
      name: "Updated Service Name",
      description: "Updated Description",
    });

    toast.promise(promise, {
      loading: "Updating service...",
      success: "Service updated!",
      error: "Failed to update service.",
    });
  };

  const handleRemoveService = (serviceId: string) => {
    const promise = remove({ id: serviceId });

    toast.promise(promise, {
      loading: "Removing service...",
      success: "Service removed!",
      error: "Failed to remove service.",
    });
  };

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-6 pt-10">
      <Image
        src="/empty.svg"
        alt="empty"
        height={300}
        width={300}
        priority
        className="h-auto dark:hidden"
      />
      <Image
        src="/empty-dark.svg"
        alt="empty dark"
        height={300}
        width={300}
        priority
        className="hidden h-auto dark:block"
      />

      <h2 className="text-lg font-medium">Welcome to Admin Management of Services</h2>

      <Button onClick={handleCreateService}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create a New Service
      </Button>

      <h3 className="text-lg font-medium pt-8">Existing Services</h3>

      <ul className="space-y-4 w-full max-w-2xl">
        {services?.length === 0 && (
          <li className="text-muted-foreground text-center">No services created yet.</li>
        )}
        {services?.map((service) => (
          <li
            key={service._id}
            className="flex items-center justify-between border rounded-lg p-4 shadow-sm"
          >
            <div>
              <div className="font-semibold">{service.name}</div>
              <div className="text-sm text-muted-foreground">{service.description}</div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleUpdateService(service._id)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleRemoveService(service._id)}>
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServicesAdminPage;