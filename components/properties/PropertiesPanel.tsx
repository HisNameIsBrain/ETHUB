// components/properties/PropertiesPanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Field =
  | { key: string; name: string; type: "text" | "url"; required?: boolean }
  | { key: string; name: string; type: "number"; required?: boolean }
  | { key: string; name: string; type: "checkbox"; required?: boolean }
  | { key: string; name: string; type: "date"; required?: boolean }
  | { key: string; name: string; type: "select"; options: { id: string; name: string }[] }
  | { key: string; name: string; type: "multi_select"; options: { id: string; name: string }[] }
  | { key: string; name: string; type: "files" }
  | { key: string; name: string; type: "relation" };

export function PropertiesPanel({ documentId }: { documentId: string }) {
  const data = useQuery(api.documentProperties.get, { id: documentId as any });
  const patch = useMutation(api.documentProperties.patch);

  const [local, setLocal] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!data) return;
    setLocal(data.properties ?? {});
  }, [data]);

  const fields: Field[] = useMemo(() => (data?.schema?.fields ?? []) as Field[], [data]);

  const setVal = (k: string, v: any) => setLocal((p) => ({ ...p, [k]: v }));

  const onSave = async () => {
    await patch({ id: documentId as any, patch: local });
  };

  if (!data) return null;

  return (
    <div className="space-y-4">
      {fields.map((f) => {
        const v = local[f.key];
        switch (f.type) {
          case "text":
            return (
              <div key={f.key} className="space-y-1">
                <label className="text-sm">{f.name}</label>
                <Input value={v ?? ""} onChange={(e) => setVal(f.key, e.target.value)} />
              </div>
            );
          case "url":
            return (
              <div key={f.key} className="space-y-1">
                <label className="text-sm">{f.name}</label>
                <Input type="url" value={v ?? ""} onChange={(e) => setVal(f.key, e.target.value)} />
              </div>
            );
          case "number":
            return (
              <div key={f.key} className="space-y-1">
                <label className="text-sm">{f.name}</label>
                <Input
                  type="number"
                  value={v ?? ""}
                  onChange={(e) => setVal(f.key, e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>
            );
          case "checkbox":
            return (
              <div key={f.key} className="flex items-center gap-2">
                <Checkbox checked={!!v} onCheckedChange={(c) => setVal(f.key, !!c)} />
                <span className="text-sm">{f.name}</span>
              </div>
            );
          case "date":
            return (
              <div key={f.key} className="space-y-1">
                <label className="text-sm">{f.name}</label>
                <Input
                  type="date"
                  value={v ? v.slice(0, 10) : ""}
                  onChange={(e) => setVal(f.key, e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              </div>
            );
          case "select":
            return (
              <div key={f.key} className="space-y-1">
                <label className="text-sm">{f.name}</label>
                <Select value={v ?? ""} onValueChange={(val) => setVal(f.key, val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options?.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          case "multi_select":
            return (
              <div key={f.key} className="space-y-1">
                <label className="text-sm">{f.name}</label>
                <Textarea
                  value={(Array.isArray(v) ? v : []).join(", ")}
                  onChange={(e) =>
                    setVal(
                      f.key,
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="Comma-separated"
                />
              </div>
            );
          case "files":
            return (
              <div key={f.key} className="space-y-1">
                <label className="text-sm">{f.name}</label>
                <Textarea
                  value={(Array.isArray(v) ? v : []).join("\n")}
                  onChange={(e) =>
                    setVal(
                      f.key,
                      e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="One URL per line"
                />
              </div>
            );
          case "relation":
            return (
              <div key={f.key} className="space-y-1">
                <label className="text-sm">{f.name}</label>
                <Input value={v ?? ""} onChange={(e) => setVal(f.key, e.target.value)} placeholder="Document ID" />
              </div>
            );
          default:
            return null;
        }
      })}
      <Button onClick={onSave}>Save properties</Button>
    </div>
  );
}
