"use client";

import { useRouter } from "next/navigation";
import { useState } from "react"; // ✅ this line was missing
import { useQuery } from "convex/react";
import { Trash } from "lucide-react";

import { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

import { Item } from "./item";
export const TrashBox = () => {
  const router = useRouter();
  const documents = useQuery(api.documents.trash);
  
  const [search, setSearch] = useState("");
  
  const filteredDocuments = documents?.filter(
    (document: Doc < "documents" > ) => {
      return document.title
        .toLowerCase()
        .includes(search.toLowerCase());
    }
  );
  
  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };
  
  return (
    <div className="space-y-2">
      <Item
        icon={Trash}
        label="Trash"
        onClick={() => {}}
        level={0}
        id="trash"
      />
      {filteredDocuments?.map((document) => (
        <Item
          key={document._id}
          id={document._id}
          label={document.title}
          onClick={() => onRedirect(document._id)}
          icon={Trash}
          level={1}
        />
      ))}
    </div>
  );
};