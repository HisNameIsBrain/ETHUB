"use client";

import { useQuery } from "convex/react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { FileIcon } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

type ServiceType = {
  _id: Id < "services" > ;
  title: string;
};

export const SearchCommand = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  
  const documents = useQuery(api.services.getSidebar) as ServiceType[] | undefined;
  
  const onSelect = (serviceId: Id < "services" > ) => {
    setOpen(false);
    router.push(`/services/${serviceId}`);
  };
  
  return (
    <Command>
      <CommandInput placeholder="Search services..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Services">
          {documents?.map((document: ServiceType) => (
            <CommandItem
              key={document._id}
              value={`${document._id}-${document.title}`}
              onSelect={() => onSelect(document._id)}
            >
              <FileIcon className="mr-2 h-4 w-4" />
              {document.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};