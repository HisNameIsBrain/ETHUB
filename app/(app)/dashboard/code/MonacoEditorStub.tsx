import React from "react";

// Lightweight fallback for the Monaco editor to keep the dashboard buildable
// without the heavy @monaco-editor/react dependency. It mirrors the minimal
// API surface used on the page component.
type MonacoEditorProps = {
  value?: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  theme?: string;
  height?: string | number;
  options?: Record<string, unknown>;
};

export default function MonacoEditorStub({
  value = "",
  onChange,
  height = "100%",
}: MonacoEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        backgroundColor: "#0f172a",
        color: "#e2e8f0",
        border: "none",
        padding: "12px",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
        fontSize: "12px",
        lineHeight: "1.5",
        boxSizing: "border-box",
      }}
    />
  );
}
