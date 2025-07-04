"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import Editor from "@/components/editor"; // import Editor from separate file
import { Id } from "@/convex/_generated/dataModel";

const DocumentIdPage = () => {
  const params = useParams();
  const documentId = params?.documentId as Id<"documents">;

  if (!documentId) {
    return <div>Invalid document ID</div>;
  }

  const document = useQuery(api.documents.getById, { documentId });
  const update = useMutation(api.documents.update);

  const onChange = (content: string) => {
    update({ id: documentId, content });
  };

  if (document === undefined) {
    // Loading state
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
        <Editor initialContent={document.content} onChange={onChange} editable />
      </div>
    </div>
  );
};

export default DocumentIdPage;
