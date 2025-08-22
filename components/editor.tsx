// components/editor.tsx
"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";

export type EditorProps = {
  initialContent?: string;
  onChange: (content: string) => void;
};

export default function Editor({ initialContent = "", onChange }: EditorProps) {
  const [value, setValue] = React.useState(initialContent);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setValue(next);
    onChange(next);
  };

  return (
    <div className="w-full mt-4">
      <Textarea
        className="w-full min-h-[200px] resize-y"
        value={value}
        onChange={handleChange}
        placeholder="Start typing your document..."
      />
    </div>
  );
}
