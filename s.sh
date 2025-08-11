#!/usr/bin/env bash
set -euo pipefail

log() { printf "\n\033[1;36m➤ %s\033[0m\n" "$*"; }

root="$(pwd)"

create() {
  local path="$1"
  local body="$2"
  if [[ -f "$path" ]]; then
    echo "  ✓ exists: $path"
  else
    echo "  → create: $path"
    mkdir -p "$(dirname "$path")"
    printf "%s" "$body" > "$path"
  fi
}

log "Ensuring UI primitives…"

# components/ui/button.tsx
create "$root/components/ui/button.tsx" $'\
"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}
const cn = (...c:string[]) => c.filter(Boolean).join(" ");
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className="", variant="default", size="md", asChild, ...props }, ref) => {
    const Comp:any = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-9 px-4 py-2",
          variant === "outline" ? "border-input bg-background hover:bg-accent hover:text-accent-foreground" :
          variant === "ghost" ? "hover:bg-accent hover:text-accent-foreground" :
          variant === "secondary" ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" :
          variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" :
          "bg-primary text-primary-foreground hover:bg-primary/90",
          size === "sm" ? "h-8 px-3" : size === "lg" ? "h-10 px-6" : size === "icon" ? "h-9 w-9 p-0" : "",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export default Button;
'

# components/ui/dialog.tsx (very small shim)
create "$root/components/ui/dialog.tsx" $'\
"use client";
import * as React from "react";

export const Dialog = ({ open, onOpenChange, children }:{ open?:boolean; onOpenChange?:(o:boolean)=>void; children:React.ReactNode }) => (
  <div data-open={open ? "true":"false"} className="relative">{children}</div>
);
export const DialogContent = ({ children }:{ children:React.ReactNode }) =>
  <div className="fixed inset-0 grid place-items-center"><div className="w-full max-w-md rounded-xl border bg-background p-4 shadow-lg">{children}</div></div>;
export const DialogHeader = ({ children }:{ children:React.ReactNode }) => <div className="mb-2">{children}</div>;
export const DialogTitle = ({ children }:{ children:React.ReactNode }) => <h3 className="text-lg font-semibold">{children}</h3>;
export const DialogFooter = ({ children }:{ children:React.ReactNode }) => <div className="mt-4 flex justify-end gap-2">{children}</div>;
'

# components/ui/skeleton.tsx
create "$root/components/ui/skeleton.tsx" $'\
"use client";
import * as React from "react";
export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} {...props} />;
}
export default Skeleton;
'

log "Ensuring app-level components…"

# components/modals/confirm-modal.tsx
create "$root/components/modals/confirm-modal.tsx" $'\
"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};
export function ConfirmModal({
  open,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o)=>{ if(!o) onCancel(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>{cancelText}</Button>
          <Button onClick={onConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default ConfirmModal;
'

# components/siri-glow-invert.tsx
create "$root/components/siri-glow-invert.tsx" $'\
"use client";
export const SiriGlowInvert = ({ className = "" }: { className?: string }) => (
  <div className={`pointer-events-none fixed inset-0 opacity-20 mix-blend-screen ${className}`} />
);
export default SiriGlowInvert;
'

# components/toolbar.tsx
create "$root/components/toolbar.tsx" $'\
"use client";
import * as React from "react";
export function Toolbar({
  className = "", left, right, title, children, ...props
}: React.HTMLAttributes<HTMLDivElement> & { left?:React.ReactNode; right?:React.ReactNode; title?:React.ReactNode }) {
  return (
    <div className={`w-full border-b bg-background ${className}`} {...props}>
      <div className="mx-auto flex max-w-6xl items-center justify-between p-2 gap-2">
        <div className="flex items-center gap-2">{left}</div>
        <div className="text-sm font-medium truncate">{title}</div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
      {children ? <div className="mx-auto max-w-6xl p-2">{children}</div> : null}
    </div>
  );
}
export default Toolbar;
'

# components/cover.tsx
create "$root/components/cover.tsx" $'\
"use client";
import * as React from "react";
export function Cover({ src, height = 180, children, className = "" }: { src?:string|null; height?:number; children?:React.ReactNode; className?:string; }) {
  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-muted ${className}`} style={{ height }}>
      {src ? <img src={src} alt="Cover" className="h-full w-full object-cover" /> :
        <div className="h-full w-full grid place-items-center text-muted-foreground text-sm">No cover</div>}
      {children ? <div className="absolute inset-0">{children}</div> : null}
    </div>
  );
}
export default Cover;
'

# components/editor.tsx
create "$root/components/editor.tsx" $'\
"use client";
import * as React from "react";
export function Editor({ value = "", onChange, placeholder = "Start typing…", readOnly = false, className = "" }:{
  value?:string; onChange?:(v:string)=>void; placeholder?:string; readOnly?:boolean; className?:string;
}) {
  if (readOnly) {
    return <div className={`prose dark:prose-invert max-w-none ${className}`}>{value || <span className="text-muted-foreground">{placeholder}</span>}</div>;
  }
  return <textarea className={`w-full min-h-[300px] resize-y rounded-md border bg-background p-3 outline-none ${className}`} value={value} placeholder={placeholder} onChange={(e)=>onChange?.(e.target.value)} />;
}
export default Editor;
'

log "Creating optional barrels for cleaner imports…"
create "$root/components/ui/index.ts" $'\
export * from "./button";
export * from "./dialog";
export * from "./skeleton";
'

echo
echo "✅ Import paths ensured."
echo "Now run:"
echo "  pnpm build || npm run build || yarn build"
