// Avoid real network in tests
vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({}) })));
