"use client";
export type EditorProps = {
  initialContent: string;
  onChange: (content: string) => void;
  editable?: boolean;
};
export function DocumentEditor({ initialContent, onChange, editable = true }: EditorProps) {
  return (
    <textarea
      className="w-full min-h-[240px] border rounded p-3"
      defaultValue={initialContent}
      readOnly={!editable}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
