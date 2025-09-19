export const noop = () => {};
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Robust absolute base URL for server/client */
export function getURL(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    'http://localhost:3000';
  return fromEnv.startsWith('http') ? fromEnv : `https://${fromEnv}`;
}

export function getErrorRedirect(path: string, errorName?: string, errorDescription?: string) {
  const error = errorName ? `error=${errorName}` : '';
  const description = errorDescription ? `&error_description=${errorDescription}` : '';
  return `${path}?${error}${description}`;
}

export function getStatusRedirect(path: string, status: string) {
  return `${path}?status=${status}`;
}

export function calculateTrialEndUnixTimestamp() {
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
  return Math.floor(trialEnd.getTime() / 1000);
}
