export const cn = (...parts: Array<string | undefined>) => parts.filter(Boolean).join(' ');
