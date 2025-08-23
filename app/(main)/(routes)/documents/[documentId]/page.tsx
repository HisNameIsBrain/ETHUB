// app/(main)/(routes)/documents/[documentId]/page.tsx

import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

export default function DocumentPage({ params }: { params: { documentId: string } }) {
  const id = params.documentId as Id<"documents">;

  // ✅ pass the correct arg name
  const document = useQuery(api.documents.getById, { documentId: id });

  const update = useMutation(api.documents.update);

  const onChange = (content: string) => {
    if (!id) return;
    void update({ id, content }); // update expects { id, ... }
  };

  if (document === undefined) return <div>Loading...</div>;
  if (document === null) return <div>Not found</div>;

  return (
    <div>
      {/* your editor/view using `document` */}
    </div>
  );
}
