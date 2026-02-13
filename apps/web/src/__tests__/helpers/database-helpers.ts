import { vi } from 'vitest';

/**
 * In-memory database simulation for integration tests
 */
export class InMemoryDatabase {
  private tables: Map<string, Map<string, any>> = new Map();

  constructor() {
    // Initialize common tables
    this.tables.set('users', new Map());
    this.tables.set('organizations', new Map());
    this.tables.set('organization_members', new Map());
    this.tables.set('org_subscriptions', new Map());
  }

  /**
   * Compatibility shim: older tests/assertions use different column names
   * than the current app schema. We store both forms so filters work.
   */
  private normalizeRecord(tableName: string, record: any) {
    const normalized = { ...record };

    if (tableName === 'organizations') {
      if (normalized.owner_id && normalized.created_by == null) {
        normalized.created_by = normalized.owner_id;
      }
      if (normalized.created_by && normalized.owner_id == null) {
        normalized.owner_id = normalized.created_by;
      }
    }

    if (tableName === 'organization_members') {
      if (normalized.org_id && normalized.organization_id == null) {
        normalized.organization_id = normalized.org_id;
      }
      if (normalized.organization_id && normalized.org_id == null) {
        normalized.org_id = normalized.organization_id;
      }
    }

    if (tableName === 'org_subscriptions') {
      if (normalized.org_id && normalized.organization_id == null) {
        normalized.organization_id = normalized.org_id;
      }
      if (normalized.organization_id && normalized.org_id == null) {
        normalized.org_id = normalized.organization_id;
      }
    }

    return normalized;
  }

  /**
   * Get a table interface for queries
   */
  table(tableName: string) {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, new Map());
    }

    const tableData = this.tables.get(tableName)!;
    let currentQuery: any = {};

    const queryBuilder = {
      select: (columns = '*') => {
        currentQuery.select = columns;
        return queryBuilder;
      },

      insert: (data: any | any[]) => {
        const records = Array.isArray(data) ? data : [data];
        const insertedRecords: any[] = [];

        records.forEach((record) => {
          const id = record.id || `${tableName}-${Math.random().toString(36).substring(7)}`;
          const fullRecord = this.normalizeRecord(tableName, { ...record, id });
          tableData.set(id, fullRecord);
          insertedRecords.push(fullRecord);
        });

        currentQuery.insertedRecords = insertedRecords;

        return {
          select: () => ({
            single: async () => {
              if (insertedRecords.length === 0) {
                return { data: null, error: { message: 'No records inserted' } };
              }
              return { data: insertedRecords[0], error: null };
            },
          }),
        };
      },

      update: (data: any) => {
        currentQuery.update = data;
        return queryBuilder;
      },

      delete: () => {
        currentQuery.delete = true;
        return queryBuilder;
      },

      eq: (column: string, value: any) => {
        if (!currentQuery.filters) currentQuery.filters = [];
        currentQuery.filters.push({ type: 'eq', column, value });
        return queryBuilder;
      },

      neq: (column: string, value: any) => {
        if (!currentQuery.filters) currentQuery.filters = [];
        currentQuery.filters.push({ type: 'neq', column, value });
        return queryBuilder;
      },

      single: async () => {
        const results = await queryBuilder.execute();
        if (!Array.isArray(results)) {
          return results;
        }
        if (results.length === 0) {
          return { data: null, error: { code: 'PGRST116', message: 'No rows found' } };
        }
        if (results.length > 1) {
          return { data: null, error: { message: 'Multiple rows found' } };
        }
        return { data: results[0], error: null };
      },

      maybeSingle: async () => {
        const results = await queryBuilder.execute();
        if (!Array.isArray(results)) {
          return results;
        }
        if (results.length === 0) {
          return { data: null, error: null };
        }
        if (results.length > 1) {
          return { data: null, error: { message: 'Multiple rows found' } };
        }
        return { data: results[0], error: null };
      },

      execute: async () => {
        let records = Array.from(tableData.values());

        // Apply filters
        if (currentQuery.filters) {
          currentQuery.filters.forEach((filter: any) => {
            records = records.filter((record) => {
              if (filter.type === 'eq') {
                return record[filter.column] === filter.value;
              }
              if (filter.type === 'neq') {
                return record[filter.column] !== filter.value;
              }
              return true;
            });
          });
        }

        // Apply update
        if (currentQuery.update) {
          records.forEach((record) => {
            Object.assign(record, currentQuery.update);
            tableData.set(record.id, record);
          });
          return { data: null, error: null };
        }

        // Apply delete
        if (currentQuery.delete) {
          records.forEach((record) => {
            tableData.delete(record.id);
          });
          return { data: null, error: null };
        }

        // Return select results
        return records;
      },
    };

    // Make execute the default promise resolution
    const executePromise = async () => {
      if (currentQuery.update || currentQuery.delete) {
        await queryBuilder.execute();
        return { data: null, error: null };
      }
      const results = await queryBuilder.execute();
      return { data: results, error: null };
    };

    // Add then/catch to make it promise-like
    (queryBuilder as any).then = (resolve: any, reject: any) => {
      return executePromise().then(resolve, reject);
    };

    return queryBuilder;
  }

  /**
   * Seed a user into the database
   */
  seedUser(userData: any) {
    const table = this.tables.get('users')!;
    const id = userData.id || `user-${Math.random().toString(36).substring(7)}`;
    const user = {
      id,
      email: userData.email || `test-${id}@example.com`,
      username: userData.username || null,
      full_name: userData.full_name || null,
      first_name: userData.first_name || null,
      last_name: userData.last_name || null,
      display_name: userData.display_name || null,
      avatar_url: userData.avatar_url || null,
      account_type: userData.account_type || 'user',
      profile_completed: userData.profile_completed ?? false,
      onboarding_completed: userData.onboarding_completed ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...userData,
    };
    table.set(id, user);
    return user;
  }

  /**
   * Seed an organization into the database
   */
  seedOrganization(orgData: any) {
    const table = this.tables.get('organizations')!;
    const id = orgData.id || `org-${Math.random().toString(36).substring(7)}`;
    const createdBy = orgData.created_by ?? orgData.owner_id;
    const ownerId = orgData.owner_id ?? orgData.created_by;
    const org = {
      id,
      name: orgData.name || 'Test Organization',
      slug: orgData.slug || `org-${id.substring(0, 8)}`,
      is_personal: orgData.is_personal ?? false,
      org_type: orgData.org_type || 'team',
      created_by: createdBy,
      owner_id: ownerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...orgData,
    };
    table.set(id, this.normalizeRecord('organizations', org));
    return org;
  }

  /**
   * Seed organization membership
   */
  seedOrganizationMember(memberData: any) {
    const table = this.tables.get('organization_members')!;
    const id = memberData.id || `member-${Math.random().toString(36).substring(7)}`;
    const organizationId = memberData.organization_id ?? memberData.org_id;
    const orgId = memberData.org_id ?? memberData.organization_id;
    const member = {
      id,
      organization_id: organizationId,
      org_id: orgId,
      user_id: memberData.user_id,
      role: memberData.role || 'member',
      created_at: new Date().toISOString(),
      ...memberData,
    };
    table.set(id, this.normalizeRecord('organization_members', member));
    return member;
  }

  /**
   * Clear all data from the database
   */
  clear() {
    this.tables.forEach((table) => table.clear());
  }

  /**
   * Clear a specific table
   */
  clearTable(tableName: string) {
    const table = this.tables.get(tableName);
    if (table) {
      table.clear();
    }
  }

  /**
   * Query helper for assertions
   */
  query(tableName: string, filters?: Record<string, any>) {
    const table = this.tables.get(tableName);
    if (!table) return [];

    let records = Array.from(table.values());

    if (filters) {
      records = records.filter((record) => {
        return Object.entries(filters).every(([key, value]) => record[key] === value);
      });
    }

    return records;
  }

  /**
   * Get a single record by ID
   */
  getById(tableName: string, id: string) {
    const table = this.tables.get(tableName);
    return table?.get(id) || null;
  }

  /**
   * Check if a record exists
   */
  exists(tableName: string, filters: Record<string, any>) {
    return this.query(tableName, filters).length > 0;
  }

  /**
   * Count records
   */
  count(tableName: string, filters?: Record<string, any>) {
    return this.query(tableName, filters).length;
  }

  /**
   * Get all records from a table
   */
  getAll(tableName: string) {
    const table = this.tables.get(tableName);
    return table ? Array.from(table.values()) : [];
  }
}

/**
 * Create a new in-memory database instance
 */
export function createInMemoryDB() {
  return new InMemoryDatabase();
}

/**
 * Create a mock Supabase database client
 */
export function mockSupabaseDatabase(db: InMemoryDatabase) {
  return {
    from: (tableName: string) => db.table(tableName),
  };
}
