"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";

// Load Editor dynamically to disable SSR
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

const DocumentIdPage = () => {
  const params = useParams() as { documentId: Id < "documents" > };
  
  // State to track update status & errors
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState < string | null > (null);
  
  // Queries & Mutations must be called unconditionally at the top
  const document = useQuery(api.documents.getDocumentById, {
    documentId: params.documentId,
  });
  const update = useMutation(api.documents.updateDocumentDocument);
  
  const onChange = async (content: string) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      await update({ id: params.documentId, content });
    } catch (err) {
      setUpdateError("Failed to update document content.");
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (document === undefined) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }
  
  if (document === null) {
    return <div>Not found</div>;
  }
  
  return (
    <div className="pb-40">
      <Cover url={document.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={document} />
        <Editor initialContent={document.content} onChange={onChange} />
        {isUpdating && (
          <p className="mt-2 text-sm text-gray-500">Saving changes...</p>
        )}
        {updateError && (
          <p className="mt-2 text-sm text-red-600">{updateError}</p>
        )}
      </div>
    </div>
  );
};

export default DocumentIdPage;