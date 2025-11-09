// components/documents/NewDocFromTemplate.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export function NewDocFromTemplate({ parentId }: { parentId?: string }) {
  const templates = useQuery(api.templates.list, {});
  const create = useMutation(api.templates.createDocumentFromTemplate);

  const [title, setTitle] = useState("");
  const [tpl, setTpl] = useState<string>("");

  const onCreate = async () => {
    if (!title || !tpl) return;
    const id = await create({
      title,
      templateId: tpl as any,
      parentDocument: parentId ? (parentId as any) : undefined,
      overrides: {},
    });
    window.location.assign(`/documents/${id}`);
  };

  return (
    <div className="flex gap-2">
      <Input placeholder="Untitled" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Select value={tpl} onValueChange={setTpl}>
        <SelectTrigger><SelectValue placeholder="Template" /></SelectTrigger>
        <SelectContent>
          {templates?.map((t) => (
            <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={onCreate}>Create</Button>
    </div>
  );
}
