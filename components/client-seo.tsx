"use client";

import { useEffect } from "react";

type Meta = { name?: string; property?: string; content: string };

export default function ClientSEO({
  title,
  description,
  metas = [],
}: {
  title?: string;
  description?: string;
  metas?: Meta[];
}) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }

    for (const m of metas) {
      const selector = m.name
        ? `meta[name="${m.name}"]`
        : m.property
        ? `meta[property="${m.property}"]`
        : "";
      let tag = selector ? document.querySelector<HTMLMetaElement>(selector) : null;
      if (!tag) {
        tag = document.createElement("meta");
        if (m.name) tag.setAttribute("name", m.name);
        if (m.property) tag.setAttribute("property", m.property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", m.content);
    }
  }, [title, description, metas]);

  return null;
}
