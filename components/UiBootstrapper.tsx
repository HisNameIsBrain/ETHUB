"use client";
import { useEffect } from "react";

/**
 * Drop this once in your root layout to initialize DOM-based UI libs
 * without raw <script> tags inside components.
 *
 * Example: Flowbite / TW Elements / Lottie / Typed.js…
 * Just uncomment or add imports below.
 */
export default function UiBootstrapper() {
  useEffect(() => {
    // Example dynamic imports (uncomment what you use):
    // import("tw-elements");        // TW Elements
    // import("flowbite");           // Flowbite
    // import("typed.js");           // Typed.js (if you wrap it yourself)
    // import("lottie-web");         // Lottie (if you use it directly)
  }, []);
  return null;
}
