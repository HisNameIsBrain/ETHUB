import { ServiceId } from "@/convex/_generated/dataModel";

export type Service = {
  serviceId: Id<"services">;
  name: string;
  description?: string;
  price: number;
  deliveryTime: string;
  type?: string;
  orgId?: Id<"organizations">;
  isArchived?: boolean;
};