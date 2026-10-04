import "server-only";
import { LocalContentProvider } from "./local";
import type { ContentProvider } from "./types";

/**
 * Single switch point for the data source.
 *
 * Today: CONTENT_PROVIDER is unset (or "local") → JSON files in /content.
 * Later: implement SupabaseContentProvider with the same ContentProvider
 * interface, add a "supabase" case here, and set CONTENT_PROVIDER=supabase.
 * No page or component changes are needed.
 */
export function getContent(): ContentProvider {
  const provider = process.env.CONTENT_PROVIDER ?? "local";
  switch (provider) {
    case "local":
      return LocalContentProvider;
    default:
      throw new Error(`Unknown CONTENT_PROVIDER "${provider}". Supported: local`);
  }
}

export type { ContentProvider } from "./types";
