"use client";

import { useCallback, useSyncExternalStore, type SetStateAction } from "react";

const STORAGE_KEY = "bloom-playground";

// All persisted settings share one localStorage key (an object keyed by
// `key`) instead of one entry per setting, kept in a module-level cache that
// every hook subscribes to. The subscription is what lets two components hold
// the same key and stay in step — the sidebar picks the install source, the
// playground's snippet has to follow it.
//
// Only ever used inside components rendered with `ssr: false` (see
// app/page.tsx), so there's no server-rendered HTML to hydrate against —
// reading the store straight in the snapshot means the very first client
// render already has the persisted value, no default-then-swap flash.
let store: Record<string, unknown> | null = null;
const listeners = new Set<() => void>();

function read(): Record<string, unknown> {
   if (store) return store;

   let loaded: Record<string, unknown>;
   try {
      const raw = localStorage.getItem(STORAGE_KEY);
      loaded = raw ? JSON.parse(raw) : {};
   } catch {
      loaded = {}; // private browsing, storage disabled, etc.
   }

   store = loaded;
   return loaded;
}

function write(next: Record<string, unknown>) {
   store = next;
   try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
   } catch {
      // ignore — the in-memory store still holds for this session
   }
   listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
   listeners.add(notify);
   return () => {
      listeners.delete(notify);
   };
}

export function usePersistedState<T>(key: string, defaultValue: T) {
   // stable between writes: `store` is only ever replaced wholesale in write(),
   // so repeated snapshots return the identical value and don't loop
   const getSnapshot = useCallback(() => {
      const current = read();
      return key in current ? (current[key] as T) : defaultValue;
   }, [key, defaultValue]);

   const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

   const setValue = useCallback(
      (next: SetStateAction<T>) => {
         const current = read();
         const prev = (key in current ? current[key] : defaultValue) as T;
         const resolved = typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
         write({ ...current, [key]: resolved });
      },
      [key, defaultValue]
   );

   return [value, setValue] as const;
}
