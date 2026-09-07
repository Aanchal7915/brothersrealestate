import { useCallback, useEffect, useState } from "react";

const KEY = "brothersFavourites";

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

/**
 * Per-visitor saved properties, persisted to localStorage.
 * There is no favourites API on the backend, so this is deliberately
 * device-local — it never pretends to be an account-level saved list.
 * Syncs across components in the same tab via a custom event.
 */
export default function useFavourites() {
  const [ids, setIds] = useState(read);

  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener("brothers:favourites", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("brothers:favourites", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id) => {
    if (!id) return;
    const current = read();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch (e) {
      /* storage unavailable — keep the in-memory state anyway */
    }
    setIds(next);
    window.dispatchEvent(new Event("brothers:favourites"));
  }, []);

  const isFavourite = useCallback((id) => ids.includes(id), [ids]);

  return { ids, toggle, isFavourite };
}
