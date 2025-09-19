export function getErrorRedirect(message = "error") { return `/error?m=${encodeURIComponent(message)}`; }
export function getStatusRedirect(message = "ok") { return `/status?m=${encodeURIComponent(message)}`; }
