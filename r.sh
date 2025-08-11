
mkdir -p components/modals

cat > components/modals/confirm-modal.tsx <<'TSX'
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

type ConfirmModalProps = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  children: React.ReactNode; // trigger element, e.g. a Button
  className?: string;
};

export function ConfirmModal({
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  children,
  className = "",
}: ConfirmModalProps) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  const close = () => setOpen(false);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await onConfirm();
      close();
    } finally {
      setSubmitting(false);
    }
  };

  const Trigger = React.cloneElement(children as React.ReactElement, {
    onClick: (e: React.MouseEvent) => {
      children && (children as any).props?.onClick?.(e);
      setOpen(true);
    },
  });

  return (
    <>
      {Trigger}
      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            aria-modal="true"
            role="dialog"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
              onClick={close}
            />
            <div
              className={`relative z-[101] w-full max-w-sm rounded-xl border bg-white p-4 shadow-lg dark:border-white/10 dark:bg-neutral-900 ${className}`}
            >
              <div className="space-y-1">
                <h2 className="text-base font-semibold">{title}</h2>
                {description ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {description}
                  </p>
                ) : null}
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  className="px-3 py-2 text-sm"
                  onClick={close}
                  disabled={submitting}
                >
                  {cancelText}
                </Button>
                <Button
                  type="button"
                  className="px-3 py-2 text-sm"
                  onClick={handleConfirm}
                  disabled={submitting}
                >
                  {submitting ? "Working..." : confirmText}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default ConfirmModal;
TSX
