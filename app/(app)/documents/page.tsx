"use client";

import React, { useMemo, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Home,
  Layers,
  FileText,
  BookOpen,
  Users,
  Settings,
  Grid,
  Plus,
  Book,
  List,
  Tag,
  ChevronRight,
  ChevronDown,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---- Types matching your schema ----
type DocId = string;

type DocumentRow = {
  _id: DocId;
  title: string;
  content?: string;
  userId: string;

  parentDocument?: DocId;
  isArchived?: boolean;

  templateId?: string;
  propertySchemaId?: string;
  properties?: Record<string, any>;

  coverImage?: string;
  createdAt?: number;
  updatedAt?: number;

  isPublished?: boolean;
};

type DocNode = DocumentRow & { children: DocNode[] };

export default function DocumentsPage() {
  const router = useRouter();

  const docsResult = useQuery(api.documents.getAll) as DocumentRow[] | undefined;
  const docs = useMemo(() => docsResult ?? [], [docsResult]);
  const create = useMutation(api.documents.create);

  const tree = useMemo(() => buildTree(docs), [docs]);
  const favorites = useMemo(
    () => docs.filter((d) => Boolean(d.properties?.favorite)),
    [docs]
  );

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      {/* SIDEBAR */}
      <aside
        className={cn(
          "w-72 md:w-80 flex-shrink-0",
          "bg-secondary text-secondary-foreground",
          "border-r border-border",
          "px-2 py-2 md:px-3 md:py-3",
          "flex flex-col"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 px-1 mb-3 md:mb-4">
          <div className="rounded-md w-8 h-8 md:w-9 md:h-9 bg-background border border-border flex items-center justify-center text-xs font-semibold">
            TH
          </div>
          <h1 className="text-sm font-semibold truncate">Tech Hub</h1>
        </div>

        <nav className="flex-1 overflow-auto pr-1 space-y-3">
          <Section title="Favorites">
            {favorites.length === 0 ? (
              <div className="text-xs text-muted-foreground px-2 py-1">
                No favorites yet
              </div>
            ) : (
              favorites.map((doc) => (
                <NavDocItem
                  key={doc._id}
                  doc={doc}
                  depth={0}
                  onOpen={() => router.push(`/documents/${doc._id}` as Route)}
                />
              ))
            )}
          </Section>

          <Section title="Teamspaces">
            {tree.map((node) => (
              <NavTreeItem
                key={node._id}
                node={node}
                depth={0}
                onOpen={(id) => router.push(`/documents/${id}` as Route)}
              />
            ))}
          </Section>

          <Section title="Private">
            <button
              className="
                flex items-center gap-2
                px-2 py-1.5 rounded-md
                hover:bg-primary/5 transition
                w-full text-left text-sm
              "
              onClick={async () => {
                const id = await create({});
                router.push(`/documents/${id}` as Route);
              }}
            >
              <Plus size={15} className="text-muted-foreground" />
              <span>Add new</span>
            </button>
          </Section>
        </nav>

        {/* Bottom links */}
        <div className="mt-2 pt-2 border-t border-border space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-1.5 rounded hover:bg-primary/5 cursor-pointer transition">
            <Settings size={15} />
            <span>Settings</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-1.5 rounded hover:bg-primary/5 cursor-pointer transition">
            <Users size={15} />
            <span>Marketplace</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 py-5 md:px-8 md:py-8 overflow-auto">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Your notes
          </h2>
          <div className="text-sm text-muted-foreground mb-6">
            Select a document on the left.
          </div>

          {tree.length > 0 && (
            <>
              <h3 className="text-base font-semibold mb-2">Recent</h3>
              <ul className="space-y-1.5">
                {tree.slice(0, 6).map((d) => (
                  <li key={d._id}>
                    <button
                      className="
                        text-left text-sm font-medium
                        underline underline-offset-2
                        hover:text-foreground transition
                      "
                      onClick={() =>
                        router.push(`/documents/${d._id}` as Route)
                      }
                    >
                      {d.title || "Untitled"}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------------- UI bits ---------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground uppercase mb-1 px-2">
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavTreeItem({
  node,
  depth,
  onOpen,
}: {
  node: DocNode;
  depth: number;
  onOpen: (id: DocId) => void;
}) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="
          flex items-center gap-1.5
          px-2 py-1.5 rounded-md
          cursor-pointer hover:bg-primary/5 transition
          text-sm
        "
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={() => onOpen(node._id)}
      >
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setOpen((v) => !v);
          }}
        >
          {hasChildren ? (
            open ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : (
            <span className="inline-block w-3" />
          )}
        </button>

        <div className="w-6 h-6 flex items-center justify-center rounded">
          {iconForDoc(node)}
        </div>

        <div className="truncate flex-1">
          {node.title || "Untitled"}
        </div>

        {node.isArchived && (
          <Archive size={12} className="text-muted-foreground/70" />
        )}
      </div>

      {hasChildren && open && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <NavTreeItem
              key={child._id}
              node={child}
              depth={depth + 1}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavDocItem({
  doc,
  depth,
  onOpen,
}: {
  doc: DocumentRow;
  depth: number;
  onOpen: () => void;
}) {
  return (
    <div
      className="
        flex items-center gap-2
        px-2 py-1.5 rounded-md
        cursor-pointer hover:bg-primary/5 transition
        text-sm
      "
      style={{ paddingLeft: 8 + depth * 12 }}
      onClick={onOpen}
    >
      <div className="w-6 h-6 flex items-center justify-center rounded">
        {iconForDoc(doc)}
      </div>
      <div className="truncate flex-1">
        {doc.title || "Untitled"}
      </div>
    </div>
  );
}

/* ---------------- Data helpers ---------------- */

function buildTree(docs: DocumentRow[]): DocNode[] {
  const byId = new Map<DocId, DocNode>();
  const roots: DocNode[] = [];

  for (const d of docs) {
    if (d.isArchived) continue;
    byId.set(d._id, { ...d, children: [] });
  }

  for (const node of byId.values()) {
    if (node.parentDocument && byId.has(node.parentDocument)) {
      byId.get(node.parentDocument)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortFn = (a: DocNode, b: DocNode) => {
    const au = a.updatedAt ?? 0;
    const bu = b.updatedAt ?? 0;
    if (au !== bu) return bu - au;
    return a.title.localeCompare(b.title);
  };

  const sortDeep = (nodes: DocNode[]) => {
    nodes.sort(sortFn);
    for (const n of nodes) sortDeep(n.children);
  };
  sortDeep(roots);

  return roots;
}

function iconForDoc(
  doc: Pick<
    DocumentRow,
    "templateId" | "propertySchemaId" | "isPublished" | "parentDocument" | "title"
  >
) {
  const iconClass = "text-muted-foreground";

  if (doc.isPublished) return <BookOpen size={16} className={iconClass} />;
  if (doc.parentDocument) return <FileText size={16} className={iconClass} />;

  const t = (doc.title || "").toLowerCase();
  if (t.includes("inventory")) return <Layers size={16} className={iconClass} />;
  if (t.includes("handbook")) return <Book size={16} className={iconClass} />;
  if (t.includes("update") || t.includes("investor"))
    return <Users size={16} className={iconClass} />;
  if (t.includes("hierarchy") || t.includes("list"))
    return <List size={16} className={iconClass} />;
  if (t.includes("sds") || t.includes("safety"))
    return <Tag size={16} className={iconClass} />;
  if (t.includes("tech hub")) return <Home size={16} className={iconClass} />;

  return <Grid size={16} className={iconClass} />;
}
