import { vi } from 'vitest';

type TableMock = {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  lte: ReturnType<typeof vi.fn>;
  lt: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  __queueEqResponse: (response: { data?: any; error?: any }) => void;
  __queueSingleResponse: (response: { data: any; error: any }) => void;
};

function createTableMock(): TableMock {
  const eqResponses: Array<{ data?: any; error?: any }> = [];
  const singleResponses: Array<{ data: any; error: any }> = [];

  let lastResponse: { data?: any; error?: any } = { data: null, error: null };

  const single = vi.fn(async () =>
    singleResponses.length ? singleResponses.shift()! : lastResponse,
  );

  const builder = () => ({
    ...lastResponse,
    select,
    eq,
    single,
    update,
    delete: deleteFn,
    insert,
    upsert,
    order,
    gte,
    lte,
    lt,
    range,
    limit,
    or,
  });

  const select = vi.fn(() => builder());
  const update = vi.fn(() => builder());
  const insert = vi.fn(() => builder());
  const upsert = vi.fn(() => builder());
  const deleteFn = vi.fn(() => builder());
  const order = vi.fn(() => builder());
  const gte = vi.fn(() => builder());
  const lte = vi.fn(() => builder());
  const lt = vi.fn(() => builder());
  const range = vi.fn(() => builder());
  const limit = vi.fn(() => builder());
  const or = vi.fn(() => builder());

  const eq = vi.fn(() => {
    lastResponse = eqResponses.length ? eqResponses.shift()! : lastResponse;
    return builder();
  });

  const __queueEqResponse = (response: { data?: any; error?: any }) => eqResponses.push(response);
  const __queueSingleResponse = (response: { data: any; error: any }) =>
    singleResponses.push(response);

  return {
    select,
    eq,
    single,
    update,
    insert,
    upsert,
    delete: deleteFn,
    order,
    gte,
    lte,
    lt,
    limit,
    or,
    __queueEqResponse,
    __queueSingleResponse,
  };
}

type SeedData = Record<string, any | any[]>;

export function createSupabaseMock() {
  const tableMocks: Record<string, TableMock> = {};

  const getTable = (table: string) => {
    if (!tableMocks[table]) {
      tableMocks[table] = createTableMock();
    }
    return tableMocks[table];
  };

  const from = vi.fn((table: string) => getTable(table));

  const seedWith = (seed: SeedData = {}) => {
    Object.entries(seed).forEach(([table, rows]) => {
      const tableMock = getTable(table);
      const records = Array.isArray(rows) ? rows : [rows];
      records.forEach((row) => {
        tableMock.__queueEqResponse({ data: row, error: null });
        tableMock.__queueSingleResponse({ data: row, error: null });
      });
    });
  };

  return {
    supabase: { from },
    getTable,
    seedWith,
  };
}
