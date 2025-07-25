// /types/user.ts

import type { UserResource } from "@clerk/nextjs/dist/api";

export interface ExtendedUser extends UserResource {
  publicMetadata: {
    organizationId?: string;
  };
}