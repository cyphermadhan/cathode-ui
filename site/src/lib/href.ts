/**
 * Prefix an internal path with the configured base URL so links work
 * on both the dev server (base = "/") and GitHub Pages (base =
 * "/cathode-ui/"). Call in every `<a href>` that points at a page
 * inside the site.
 *
 * `import.meta.env.BASE_URL` is resolved by Astro at build time from
 * the `base` setting in astro.config.mjs. Defaults to "/" in dev.
 *
 * External URLs (http…, mailto:, #hash) should not be passed through
 * this — use the raw value.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL; // e.g. "/cathode-ui/" or "/"
  const trimmed = path.startsWith('/') ? path.slice(1) : path;
  const normalized = base.endsWith('/') ? base : base + '/';
  return normalized + trimmed;
}

/**
 * Compare a nav-item path against the current URL pathname, accounting
 * for the base prefix and any trailing slashes Astro adds to directory-
 * style URLs. Used by the sidebar to set `is-active` correctly.
 */
export function isActiveHref(itemPath: string, currentPath: string): boolean {
  const target = withBase(itemPath).replace(/\/$/, '');
  const current = currentPath.replace(/\/$/, '');
  if (target === '' || target === withBase('/').replace(/\/$/, '')) {
    return current === target;
  }
  return current === target || current.startsWith(target + '/');
}
