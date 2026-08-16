"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "bloom-playground";

function readStore(): Record<string, unknown> {
   try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
   } catch {
      return {};
   }
}

function writeStore(store: Record<string, unknown>) {
   try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
   } catch {
      // ignore — private browsing, storage disabled, etc.
   }
}

// All persisted settings share one localStorage key (an object keyed by
// `key`) instead of one entry per setting. Only ever used inside components
// rendered with `ssr: false` (see app/page.tsx), so there's no server-
// rendered HTML to hydrate against — reading the store straight in the
// initializer means the very first client render already has the
// persisted value, no default-then-swap flash.
export function usePersistedState<T>(key: string, defaultValue: T) {
   const [value, setValue] = useState<T>(() => {
      const store = readStore();
      return key in store ? (store[key] as T) : defaultValue;
   });

   useEffect(() => {
      const store = readStore();
      store[key] = value;
      writeStore(store);
   }, [key, value]);

   return [value, setValue] as const;
}
