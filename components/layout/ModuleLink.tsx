"use client";
import Link from "next/link";
import type { ComponentProps } from "react";
export function ModuleLink(props: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        if (
          !navigator.onLine &&
          typeof props.href === "string" &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey
        ) {
          event.preventDefault();
          window.history.pushState(null, "", props.href);
        } else props.onClick?.(event);
      }}
    />
  );
}
