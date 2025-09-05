"use client";

import ClientSEO from "@/components/client-seo";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientSEO
        title="ETHUB — Marketing"
        description="Learn more about ETHUB."
        metas={[
          { property: "og:title", content: "ETHUB — Marketing" },
          { property: "og:description", content: "Learn more about ETHUB." },
        ]}
      />
      {children}
    </>
  );
}
