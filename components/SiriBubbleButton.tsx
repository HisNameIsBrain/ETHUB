"use client";
export default function SiriBubbleButton({
  onOpenEventName = "siri-bubble:open",
}: {
  onOpenEventName?: string;
}) {
  return (
    <button
      aria-label="Open assistant"
      data-open-assistant-trigger
      className="group relative grid h-14 w-14 place-items-center rounded-full border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-lg hover:shadow-xl transition-all"
      onClick={() => {
        const evt = new CustomEvent(onOpenEventName);
        window.dispatchEvent(evt);
      }}
    >
      <div className="relative z-[1] h-3 w-3 rounded-full bg-foreground/80 group-hover:scale-110 transition-transform" />
    </button>
  );
}
