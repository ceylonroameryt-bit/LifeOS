"use client";
import { useEffect, useState } from "react";
export function useData<T>(load: () => Promise<T>, initial: T, event: string) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      void load()
        .then((value) => {
          if (active) setData(value);
        })
        .catch(() => {});
    };
    refresh();
    window.addEventListener(event, refresh);
    return () => {
      active = false;
      window.removeEventListener(event, refresh);
    };
  }, [load, event]);
  return data;
}
