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
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({
      file,
    });

    return response.url;
  };

  if (!isMounted) return null;

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

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    </div>
  );
};

export default Editor;
