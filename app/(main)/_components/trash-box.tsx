"use client";
import type { Route } from "next";
// app/(main)/_components/trash-box.tsx
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Spinner } from "@/components/spinner";
import { Search, Trash, Undo } from "lucide-react";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Input } from "@/components/ui/input";

// Minimal shape we need for UI (matches Convex docs table)
type UIDocument = {
  _id: Id<"documents">;
  title: string;
};

export const TrashBox = () => {
  const router = useRouter();
  const params = useParams();

  const documents = useQuery(api.documents.getTrash) as UIDocument[] | undefined;
  const restore = useMutation(api.documents.restore);
  const remove = useMutation(api.documents.remove);

  const [search, setSearch] = useState(&quot;&quot;);

  const filteredDocuments = documents?.filter((document: UIDocument) =>
    (document.title ?? &quot;&quot;).toLowerCase().includes(search.toLowerCase())
  );

  const onClick = (documentId: Id<"documents">) => {
    router.push(&quot;/documents/${documentId}&quot; as Route);
  };

  const onRestore = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    documentId: Id<"documents">
  ) => {
    event.stopPropagation();
    const promise = restore({ id: documentId });
    toast.promise(promise, {
      loading: &quot;Restoring page…&quot;,
      success: &quot;Page restored!&quot;,
      error: &quot;Failed to restore page.&quot;,
    });
  };

  const onRemove = (documentId: Id<"documents">) => {
    const promise = remove({ id: documentId });
    toast.promise(promise, {
      loading: &quot;Deleting permanently…&quot;,
      success: &quot;Page deleted.&quot;,
      error: &quot;Failed to delete page.&quot;,
    });

    // params.documentId can be string | string[] | undefined
    const openId = Array.isArray(params?.documentId)
      ? params.documentId[0]
      : params?.documentId;

    if (openId && String(openId) === String(documentId)) {
      router.push(&quot;/documents&quot; as Route);
    }
  };

  if (documents === undefined) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-x-1 p-2">
        <Search className="h-4 w-4" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className=&quot;h-7 px-2 focus-visible:ring-transparent bg-secondary&quot;
          placeholder=&quot;Filter by page title...&quot;
        />
      </div>

      <div className="mt-2 px-1 pb-1">
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No documents found.
        </p>

        {filteredDocuments?.map((document) => (
          <div
            key={document._id}
            role="button"
            onClick={() => onClick(document._id)}
            className=&quot;text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between&quot;
          >
            <span className="truncate pl-2">{document.title}</span>
            <div className="flex items-center">
              <div
                onClick={(e) => onRestore(e, document._id)}
                role=&quot;button&quot;
                className=&quot;rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600&quot;
              >
                <Undo className="h-4 w-4 text-muted-foreground" />
              </div>
              <ConfirmModal onConfirm={() => onRemove(document._id)}>
                <div
                  role="button"
                  className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                >
                  <Trash className="h-4 w-4 text-muted-foreground" />
                </div>
              </ConfirmModal>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
