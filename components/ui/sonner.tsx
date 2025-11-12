"use client";

import * as React from "react";
import { Toaster as SonnerToaster } from "sonner";

export type { ExternalToast, toast } from "sonner";

export function Toaster({
  position = "top-right",
  richColors = true,
  closeButton = true,
  ...props
}: React.ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      position={position}
      richColors={richColors}
      closeButton={closeButton}
      {...props}
    />
  );
}
