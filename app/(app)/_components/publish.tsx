"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type DocShape = { _id: string; isPublished?: boolean };
type PublishProps =
  | { doc: DocShape; initialData?: never }
  | { initialData: DocShape; doc?: never };

export function Publish(props: PublishProps) {
  const doc = (props as any).doc ?? (props as any).initialData;
  const update = useMutation(api.documents.update);
  const toggle = () => doc && update({ id: doc._id as any, isPublished: !Boolean(doc.isPublished) });

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-sm px-2 py-1 border rounded-md hover:bg-muted"
    >
      {doc?.isPublished ? "Unpublish" : "Publish"}
    </button>
  );
}

// Back-compat export if some files still import PublishToggle
export { Publish as PublishToggle };
export default Publish;
