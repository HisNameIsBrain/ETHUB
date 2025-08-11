<<<<<<< HEAD
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  BlockNoteEditor,
  PartialBlock,
} from "@blocknote/core";
import {
  BlockNoteView,
  useBlockNote,
} from "@blocknote/react";
import "@blocknote/core/style.css";

import { useEdgeStore } from "../lib/edgestore";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };

  // ✅ Call hook unconditionally
  const editor: BlockNoteEditor = useBlockNote({
    editable,
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    onEditorContentChange: (editor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
    uploadFile: handleUpload,
  });

  // ✅ Guard rendering (not hook calls) until mounted
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    </div>
  );
};

=======
\
"use client";
import React from "react";

export type EditorProps = {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
};

// Minimal controlled editor stub. Replace later with TipTap/Slate/etc.
export function Editor({
  value = "",
  onChange,
  placeholder = "Start typing…",
  readOnly = false,
  className = "",
}: EditorProps) {
  if (readOnly) {
    return (
      <div className={`prose dark:prose-invert max-w-none ${className}`}>
        {value || <span className="text-muted-foreground">{placeholder}</span>}
      </div>
    );
  }
  return (
    <textarea
      className={`w-full min-h-[300px] resize-y rounded-md border bg-background p-3 outline-none ${className}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}
>>>>>>> a2a5ad9 (convex)
export default Editor;
