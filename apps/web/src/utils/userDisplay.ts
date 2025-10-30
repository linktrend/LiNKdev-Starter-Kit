export type UserLike = {
	email?: string | null;
	name?: string | null;
	full_name?: string | null;
	username?: string | null;
	user_metadata?: {
		full_name?: string | null;
		username?: string | null;
	} | null;
};

export type UserDisplay = {
	primary: string; // display name
	secondary: string; // username
};

/**
 * Derive display name and username from various user shapes.
 * - primary (display name): user.user_metadata.full_name || user.full_name || user.name || email prefix || "Unknown User"
 * - secondary (username): user.user_metadata.username || user.username || email prefix || "unknown"
 */
export function getUserDisplay(user: UserLike | null | undefined): UserDisplay {
	const email = (user?.email ?? '').trim();
	const emailPrefix = email.includes('@') ? email.split('@')[0] : (email || '').trim();

	const displayName =
		(user?.user_metadata?.full_name ?? undefined) ||
		(user?.full_name ?? undefined) ||
		(user?.name ?? undefined) ||
		emailPrefix ||
		'Unknown User';

	const username =
		(user?.user_metadata?.username ?? undefined) ||
		(user?.username ?? undefined) ||
		emailPrefix ||
		'unknown';

	return { primary: String(displayName), secondary: String(username) };
}
