"use client";

import { useEffect, useState } from "react";
import Router from "next/router";
import { SiriGlow } from "@/components/siri-glow";

export default function LoadingIndicator() {
 const [loading, setLoading] = useState(false);
 
 useEffect(() => {
  const start = () => setLoading(true);
  const done = () => setTimeout(() => setLoading(false), 300); // smooth fade
  
  Router.events.on(&quot;routeChangeStart&quot;, start);
  Router.events.on(&quot;routeChangeComplete&quot;, done);
  Router.events.on(&quot;routeChangeError&quot;, done);
  
  return () => {
   Router.events.off(&quot;routeChangeStart&quot;, start);
   Router.events.off(&quot;routeChangeComplete&quot;, done);
   Router.events.off(&quot;routeChangeError&quot;, done);
  };
 }, []);
 
 return loading ? (
  <div className="fixed top-0 left-0 w-full h-[4px] z-[9999] overflow-hidden">
   <SiriGlow height="4px" />
    </div>
 ) : null;
}