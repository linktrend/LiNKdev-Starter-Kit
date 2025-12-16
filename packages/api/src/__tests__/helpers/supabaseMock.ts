import { vi } from 'vitest';

type TableMock = {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  __queueEqResponse: (response: { data?: any; error?: any }) => void;
  __queueSingleResponse: (response: { data: any; error: any }) => void;
};

function createTableMock(): TableMock {
  const eqResponses: Array<{ data?: any; error?: any }> = [];
  const singleResponses: Array<{ data: any; error: any }> = [];

  const single = vi.fn(async () =>
    singleResponses.length ? singleResponses.shift()! : { data: null, error: null },
  );
  let eq: ReturnType<typeof vi.fn>;
  const select = vi.fn(() => ({ eq, single }));
  const update = vi.fn(() => ({ eq, select, single }));
  const insert = vi.fn(() => ({ select, single }));
  const upsert = vi.fn(() => ({ select, single }));
  const deleteFn = vi.fn(() => ({ eq, single }));
  eq = vi.fn(() => {
    const response = eqResponses.length ? eqResponses.shift()! : { data: null, error: null };
    return { ...response, select, single, update, delete: deleteFn, insert, upsert, eq };
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
    __queueEqResponse,
    __queueSingleResponse,
  };
}

export function createSupabaseMock() {
  const tableMocks: Record<string, TableMock> = {};

  const getTable = (table: string) => {
    if (!tableMocks[table]) {
      tableMocks[table] = createTableMock();
    }
    return tableMocks[table];
  };

  const from = vi.fn((table: string) => getTable(table));

  return {
    supabase: { from },
    getTable,
  };
}
