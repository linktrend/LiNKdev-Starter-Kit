// Avoid real network in tests
vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({}) })));

// Suppress ReactDOMTestUtils.act deprecation warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('ReactDOMTestUtils.act is deprecated')) {
    return;
  }
  originalWarn(...args);
};
