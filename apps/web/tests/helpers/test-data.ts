export function uniqueSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export function randomEmail(prefix = 'e2e') {
  return `${prefix}-${uniqueSuffix()}@example.com`;
}

export function randomPassword() {
  return `P@ssw0rd-${uniqueSuffix()}`;
}

export function randomUsername(prefix = 'user') {
  return `${prefix}${uniqueSuffix()}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function randomOrgName(prefix = 'Org') {
  return `${prefix} ${uniqueSuffix()}`;
}

export function randomOrgSlug(prefix = 'org') {
  return `${prefix}-${uniqueSuffix()}`.toLowerCase();
}

export function randomDisplayName(prefix = 'Test User') {
  return `${prefix} ${uniqueSuffix()}`;
}
