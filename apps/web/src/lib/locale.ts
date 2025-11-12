/**
 * Build a locale-aware path for internal navigation.
 * Ensures the provided path is always prefixed with the active locale.
 */
export function buildLocalePath(locale?: string, path: string = '/') {
  const normalizedLocale = (locale && locale.length ? locale : 'en').replace(/^\//, '');
  if (!path || path === '/') {
    return `/${normalizedLocale}`;
  }

  // Allow hash or query-only strings
  if (path.startsWith('#') || path.startsWith('?')) {
    return `/${normalizedLocale}/${path}`;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Avoid double-prefixing if the path already starts with the locale
  if (normalizedPath.startsWith(`/${normalizedLocale}/`) || normalizedPath === `/${normalizedLocale}`) {
    return normalizedPath;
  }

  return `/${normalizedLocale}${normalizedPath}`;
}
