import { reportError } from "./store";
export function webUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:")
      return url.toString();
  } catch {}
  return reportError("Enter a valid http or https link.");
}
