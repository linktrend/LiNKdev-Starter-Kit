// Mock tRPC client for tests
export const createTRPCClient = vi.fn(() => ({
  useQuery: vi.fn().mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
  }),
  useMutation: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
  }),
  useUtils: vi.fn().mockReturnValue({
    invalidate: vi.fn(),
  }),
}));

export const createTRPCNext = vi.fn(() => ({
  withTRPC: vi.fn((Component) => Component),
}));
