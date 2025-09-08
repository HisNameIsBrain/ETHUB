import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/** useIsomorphicLayoutEffect */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** useDebounce */
export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** useEventListener */
export function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (e: WindowEventMap[K]) => any,
  element: Window | Document | HTMLElement | null = typeof window !== "undefined" ? window : null,
  options?: boolean | AddEventListenerOptions
) {
  const saved = useRef(handler);
  useEffect(() => void (saved.current = handler), [handler]);
  useEffect(() => {
    if (!element?.addEventListener) return;
    const listener = (e: Event) => saved.current(e as any);
    element.addEventListener(event, listener as any, options);
    return () => element.removeEventListener(event, listener as any, options);
  }, [event, element, options]);
}

/** useOnClickOutside */
export function useOnClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: (e: MouseEvent | TouchEvent) => void
) {
  useEventListener("mousedown", (e) => {
    const el = ref.current;
    if (!el || el.contains(e.target as Node)) return;
    handler(e);
  }, document);
  useEventListener("touchstart", (e) => {
    const el = ref.current;
    if (!el || el.contains(e.target as Node)) return;
    handler(e);
  }, document);
}

/** useLocalStorage */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const read = useCallback((): T => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch { return initialValue; }
  }, [key, initialValue]);

  const [stored, setStored] = useState<T>(read);

  const setValue = useCallback((val: React.SetStateAction<T>) => {
    setStored(prev => {
      const v = typeof val === "function" ? (val as any)(prev) : val;
      try { if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(v)); } catch {}
      return v;
    });
  }, [key]);

  useEffect(() => { setStored(read()); }, [read]);

  return [stored, setValue] as const;
}

/** useMediaQuery */
export function useMediaQuery(query: string) {
  const get = () => (typeof window === "undefined" ? false : window.matchMedia(query).matches);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    mql.addEventListener?.("change", handler);
    handler();
    return () => mql.removeEventListener?.("change", handler);
  }, [query]);
  return matches;
}

/** useCopyToClipboard */
export function useCopyToClipboard() {
  const [state, setState] = useState<string | null>(null);
  const copy = useCallback(async (text: string) => {
    try { await navigator.clipboard.writeText(text); setState(text); return true; }
    catch { return false; }
  }, []);
  return [state, copy] as const;
}
