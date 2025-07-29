"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Editor from "./editor"; // Adjust path if needed
import { Id } from "@/convex/_generated/dataModel";

interface DocumentEditorProps {
  initialContent: string;
  documentId: Id<"documents">;
}

export function DocumentEditor({ initialContent, documentId }: DocumentEditorProps) {
  const update = useMutation(api.documents.updateDocumentDocument);

  const onChange = (content: string) => {
    update({ id: documentId, content });
  };

  return (
    <Editor initialContent={initialContent} onChange={onChange} editable />
  );
}
