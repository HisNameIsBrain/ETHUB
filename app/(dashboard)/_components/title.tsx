"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type DocShape = { _id: string; title?: string; icon?: string };
type TitleProps =
  | { doc: DocShape; initialData?: never }
  | { initialData: DocShape; doc?: never };

export function Title(props: TitleProps) {
  const doc = (props as any).doc ?? (props as any).initialData;
  const update = useMutation(api.documents.update);

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">{doc?.icon ?? "📝"}</span>
      <input
        className="text-2xl bg-transparent outline-none"
        defaultValue={doc?.title ?? "Untitled"}
        onBlur={(e) => doc && update({ id: doc._id as any, title: e.currentTarget.value })}
        aria-label="Document title"
      />
    </div>
  );
}

export function TitleSkeleton() {
  return (
    <div className="flex items-center gap-2 animate-pulse">
      <div className="h-6 w-6 rounded bg-muted" />
      <div className="h-6 w-40 rounded bg-muted" />
    </div>
  );
}

export default Title;
