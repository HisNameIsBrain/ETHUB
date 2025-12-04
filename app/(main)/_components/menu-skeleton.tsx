"use client";
export function MenuSkeleton() {
  return (
    <div className="flex items-center gap-2 animate-pulse">
      <div className="h-8 w-8 rounded-md bg-muted" />
      <div className="h-8 w-8 rounded-md bg-muted" />
    </div>
  );
}
export default MenuSkeleton;
