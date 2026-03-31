const DEFAULT_AFTER_AUTH = "/dashboard";

/**
 * Returns a same-origin relative path for post-login redirects.
 * Rejects protocol-relative URLs, backslashes, and non-path values to avoid open redirects.
 */
export function safeCallbackUrl(
  raw: string | null | undefined,
  defaultPath: string = DEFAULT_AFTER_AUTH
): string {
  if (raw == null || raw === "") return defaultPath;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return defaultPath;
  if (trimmed.includes("\\")) return defaultPath;
  return trimmed;
}
