// components/hooks/use-window-event.ts
'use client';

import * as React from 'react';

export function useWindowEvent<T = any>(type: string, handler: (e: T) => void) {
  React.useEffect(() => {
    const fn = (e: Event) => handler(e as unknown as T);
    window.addEventListener(type, fn as EventListener);
    return () => window.removeEventListener(type, fn as EventListener);
  }, [type, handler]);
}
