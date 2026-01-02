"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SingleValue = string | undefined;
type MultipleValue = string[] | undefined;

type AccordionContextValue = {
  type: "single" | "multiple";
  value: SingleValue | MultipleValue;
  onToggle: (item: string) => void;
  collapsible?: boolean;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const AccordionItemContext = React.createContext<string | null>(null);

function useAccordionContext() {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion components must be used inside <Accordion>");
  return ctx;
}

function useAccordionItemValue() {
  const value = React.useContext(AccordionItemContext);
  if (!value) throw new Error("AccordionItem components require a value");
  return value;
}

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  value?: SingleValue | MultipleValue;
  defaultValue?: SingleValue | MultipleValue;
  onValueChange?: (value: SingleValue | MultipleValue) => void;
  collapsible?: boolean;
}

export function Accordion({
  type = "single",
  value,
  defaultValue,
  onValueChange,
  collapsible,
  className,
  children,
  ...props
}: AccordionProps) {
  const [internalValue, setInternalValue] = React.useState<SingleValue | MultipleValue>(
    defaultValue ?? (type === "single" ? undefined : [])
  );

  const currentValue = value ?? internalValue;

  const onToggle = (item: string) => {
    if (type === "single") {
      const next = currentValue === item ? (collapsible ? undefined : item) : item;
      setInternalValue(next);
      onValueChange?.(next);
    } else {
      const set = new Set<string>(Array.isArray(currentValue) ? currentValue : []);
      if (set.has(item)) {
        set.delete(item);
      } else {
        set.add(item);
      }
      const next = Array.from(set);
      setInternalValue(next);
      onValueChange?.(next);
    }
  };

  return (
    <AccordionContext.Provider value={{ type, value: currentValue, onToggle, collapsible }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={cn("border-b last:border-b-0", className)} data-value={value} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  const { onToggle, value, type } = useAccordionContext();
  const itemValue = useAccordionItemValue();
  const isOpen = type === "single" ? value === itemValue : Array.isArray(value) && value.includes(itemValue ?? "");

  return (
    <button
      type="button"
      className={cn("flex w-full items-center justify-between py-2 text-left", className)}
      aria-expanded={isOpen}
      onClick={() => itemValue && onToggle(itemValue)}
      {...props}
    >
      {children}
    </button>
  );
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  const { value, type } = useAccordionContext();
  const itemValue = useAccordionItemValue();
  const isOpen = type === "single" ? value === itemValue : Array.isArray(value) && value.includes(itemValue ?? "");

  return (
    <div
      className={cn(
        "overflow-hidden text-sm text-muted-foreground transition-[max-height,opacity] duration-200",
        isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0",
        className
      )}
      hidden={!isOpen}
      {...props}
    >
      {children}
    </div>
  );
}
