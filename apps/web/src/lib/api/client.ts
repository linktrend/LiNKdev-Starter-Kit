export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(data.error || 'API request failed', res.status, data)
  }

  return data.data
}

export const api = {
  checkUsername: (username: string) =>
    apiClient<{ available: boolean; suggestions?: string[] }>(
      `/api/check-username?username=${encodeURIComponent(username)}`
    ),

  checkSlug: (slug: string) =>
    apiClient<{ available: boolean; suggestions?: string[] }>(
      `/api/check-slug?slug=${encodeURIComponent(slug)}`
    ),

  searchUsers: (query: string, limit = 10) =>
    apiClient<any[]>(
      `/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`
    ),

  getOrgMembers: (orgId: string) =>
    apiClient<any[]>(`/api/organizations/${orgId}/members`),
}
