"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { PlusCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

// Import your ExtendedUser type
import type { ExtendedUser } from "@/types/user";

const DocumentsPage = () => {
  const router = useRouter();
  const { user } = useUser();
  
  // Cast user to ExtendedUser to access publicMetadata.organizationId
  const userExt = user as ExtendedUser | undefined;
  
  const create = useMutation(api.documents.createDocument);
  const [isLoading, setIsLoading] = useState(false);
  
  const onCreate = async () => {
    setIsLoading(true);
    try {
      if (!userExt) {
        toast.error("User not authenticated.");
        setIsLoading(false);
        return;
      }
      
      // Access orgId safely from publicMetadata
      const orgId = userExt.publicMetadata?.organizationId || "defaultOrgId";
      
      const documentId = await create({ title: "Untitled", orgId });
      toast.success("New note created!");
      router.push(`/documents/${documentId}`);
    } catch (error) {
      toast.error("Failed to create a new note.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.png"
        height={300}
        width={300}
        alt="Empty"
        className="dark:hidden"
      />
      <Image
        src="/empty-dark.png"
        height={300}
        width={300}
        alt="Empty"
        className="hidden dark:block"
      />
      <h2 className="text-lg font-medium">
        Welcome {user?.firstName}, your ETECHHUB workspace is ready.
      </h2>
      <Button onClick={onCreate} disabled={isLoading}>
        <PlusCircle className="h-4 w-4 mr-2" />
        {isLoading ? "Creating..." : "Access workspace."}
      </Button>
    </div>
  );
};

export default DocumentsPage;