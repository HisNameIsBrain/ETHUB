// components/ui/TextArea.tsx
import * as React from "react";
import { cn } from "@/lib/utils"; // Remove if you don't use class merging

const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

TextArea.displayName = "TextArea";

export { TextArea };