import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: {
    serviceId: Id < "services" > ;
  };
}

export default async function Page({ params }: PageProps): Promise < JSX.Element > {
  const user = await currentUser();
  
  if (!user || user.publicMetadata.role !== "admin") {
    redirect("/unauthorized");
  }
  
  const service = await fetchQuery(api.services.getById, {
    id: params.serviceId,
  });
  
  if (!service) {
    notFound();
  }
  
  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Service: {service.name}</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Service Name</label>
          <Input name="name" defaultValue={service.name} />
        </div>
        <div>
          <label className="block text-sm font-medium">Delivery Time</label>
          <Input name="deliveryTime" defaultValue={service.deliveryTime} />
        </div>
        <div>
          <label className="block text-sm font-medium">Price</label>
          <Input name="price" defaultValue={service.price} />
        </div>
        <Button type="submit">Update</Button>
      </form>
    </div>
  );
}