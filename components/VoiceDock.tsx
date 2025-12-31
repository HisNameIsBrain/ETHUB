"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Simplified placeholder component for the voice dock overlay. The original
 * implementation was partially committed, leaving dangling hooks at the module
 * level. This stub keeps the UI contract small while avoiding lint errors.
 */
export type VoiceDockProps = {
  open?: boolean;
  onClose?: () => void;
  model?: string;
};

export default function VoiceDock({ open = false, onClose, model }: VoiceDockProps) {
  useEffect(() => {
    if (open) return undefined;
    return undefined;
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 text-white" role="dialog" aria-modal>
      <div className="relative w-[min(540px,92vw)] rounded-2xl bg-[#0b1120] p-6 shadow-2xl ring-1 ring-white/10">
        <button
          type="button"
          aria-label="Close voice dock"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-white/10 p-2 hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Voice session</h2>
          {model ? <p className="text-sm text-white/70">Model: {model}</p> : null}
          <p className="text-sm text-white/70">
            The full voice dock experience is unavailable in this build. This placeholder keeps the page stable while we finish
            the production-ready integration.
          </p>
        </div>
      </div>
    </div>
  );
}
