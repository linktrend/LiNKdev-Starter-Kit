// Offline fallback store for Records module
// Used when TEMPLATE_OFFLINE=1 or Supabase is not configured

import { RecordType, RecordData, CreateRecordTypeInput, CreateRecordInput, UpdateRecordInput, ListRecordsInput, RecordSearchResult } from '@/types/records';

interface RecordsStore {
  recordTypes: Map<string, RecordType>;
  records: Map<string, RecordData>;
}

class InMemoryRecordsStore {
  private store: RecordsStore = {
    recordTypes: new Map(),
    records: new Map(),
  };

  // Record Types Management
  createRecordType(input: CreateRecordTypeInput, createdBy: string): RecordType {
    const recordType: RecordType = {
      id: `record-type-${Date.now()}`,
      key: input.key,
      display_name: input.display_name,
      description: input.description,
      config: input.config,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.store.recordTypes.set(recordType.id, recordType);
    console.log('RECORDS MODULE: offline fallback - created record type', recordType.id);
    return recordType;
  }

  getRecordType(id: string): RecordType | null {
    return this.store.recordTypes.get(id) || null;
  }

  getRecordTypeByKey(key: string): RecordType | null {
    return Array.from(this.store.recordTypes.values())
      .find(rt => rt.key === key) || null;
  }

  listRecordTypes(createdBy?: string): RecordType[] {
    let types = Array.from(this.store.recordTypes.values());
    
    if (createdBy) {
      types = types.filter(rt => rt.created_by === createdBy || rt.config.is_public);
    }
    
    return types;
  }

  updateRecordType(id: string, updates: Partial<RecordType>): RecordType | null {
    const recordType = this.store.recordTypes.get(id);
    if (!recordType) return null;
    
    const updated = { ...recordType, ...updates, updated_at: new Date().toISOString() };
    this.store.recordTypes.set(id, updated);
    console.log('RECORDS MODULE: offline fallback - updated record type', id);
    return updated;
  }

  deleteRecordType(id: string): boolean {
    const existed = this.store.recordTypes.has(id);
    this.store.recordTypes.delete(id);
    
    // Also delete all records of this type
    Array.from(this.store.records.values())
      .filter(record => record.type_id === id)
      .forEach(record => this.store.records.delete(record.id));
    
    console.log('RECORDS MODULE: offline fallback - deleted record type', id);
    return existed;
  }

  // Records Management
  createRecord(input: CreateRecordInput, createdBy: string): RecordData {
    const record: RecordData = {
      id: `record-${Date.now()}`,
      type_id: input.type_id,
      org_id: input.org_id,
      user_id: input.user_id,
      created_by: createdBy,
      data: input.data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.store.records.set(record.id, record);
    console.log('RECORDS MODULE: offline fallback - created record', record.id);
    return record;
  }

  getRecord(id: string): RecordData | null {
    const record = this.store.records.get(id);
    if (!record) return null;
    
    // Attach record type
    const recordType = this.store.recordTypes.get(record.type_id);
    return { ...record, record_type: recordType };
  }

  listRecords(input: ListRecordsInput = {}): RecordSearchResult {
    let records = Array.from(this.store.records.values());
    
    // Filter by type
    if (input.type_id) {
      records = records.filter(r => r.type_id === input.type_id);
    }
    
    // Filter by org/user
    if (input.org_id) {
      records = records.filter(r => r.org_id === input.org_id);
    }
    if (input.user_id) {
      records = records.filter(r => r.user_id === input.user_id);
    }
    
    // Search in data
    if (input.search) {
      const searchLower = input.search.toLowerCase();
      records = records.filter(r => 
        Object.values(r.data).some(value => 
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Sort
    if (input.sort_by) {
      records.sort((a, b) => {
        const aVal = a.data[input.sort_by!] || '';
        const bVal = b.data[input.sort_by!] || '';
        const order = input.sort_order === 'desc' ? -1 : 1;
        return aVal < bVal ? -1 * order : aVal > bVal ? 1 * order : 0;
      });
    } else {
      // Default sort by created_at desc
      records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    // Pagination
    const total = records.length;
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    const paginatedRecords = records.slice(offset, offset + limit);
    
    // Attach record types
    const recordsWithTypes = paginatedRecords.map(record => {
      const recordType = this.store.recordTypes.get(record.type_id);
      return { ...record, record_type: recordType };
    });
    
    return {
      records: recordsWithTypes,
      total,
      has_more: offset + limit < total,
    };
  }

  updateRecord(id: string, updates: UpdateRecordInput): RecordData | null {
    const record = this.store.records.get(id);
    if (!record) return null;
    
    const updated = { 
      ...record, 
      data: { ...record.data, ...updates.data },
      updated_at: new Date().toISOString() 
    };
    this.store.records.set(id, updated);
    console.log('RECORDS MODULE: offline fallback - updated record', id);
    return updated;
  }

  deleteRecord(id: string): boolean {
    const existed = this.store.records.has(id);
    this.store.records.delete(id);
    console.log('RECORDS MODULE: offline fallback - deleted record', id);
    return existed;
  }

  // Utility methods
  getRecordsByType(typeId: string): RecordData[] {
    return Array.from(this.store.records.values())
      .filter(record => record.type_id === typeId);
  }

  getRecordsByOrg(orgId: string): RecordData[] {
    return Array.from(this.store.records.values())
      .filter(record => record.org_id === orgId);
  }

  getRecordsByUser(userId: string): RecordData[] {
    return Array.from(this.store.records.values())
      .filter(record => record.user_id === userId);
  }

  // Seed with sample data for development
  seedSampleData(userId: string, orgId?: string): void {
    console.log('RECORDS MODULE: offline fallback - seeding sample data');
    
    // Create sample record types
    const contactType = this.createRecordType({
      key: 'contact',
      display_name: 'Contact',
      description: 'Customer or business contact',
      config: {
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'email', label: 'Email', type: 'email', required: true },
          { key: 'phone', label: 'Phone', type: 'text' },
          { key: 'company', label: 'Company', type: 'text' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        is_public: true,
      },
    }, userId);

    const taskType = this.createRecordType({
      key: 'task',
      display_name: 'Task',
      description: 'Project task or todo item',
      config: {
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'status', label: 'Status', type: 'select', options: ['todo', 'in_progress', 'done'], required: true },
          { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] },
          { key: 'due_date', label: 'Due Date', type: 'date' },
        ],
        is_public: true,
      },
    }, userId);

    // Create sample records
    this.createRecord({
      type_id: contactType.id,
      org_id: orgId,
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-0123',
        company: 'Acme Corp',
        notes: 'Important client',
      },
    }, userId);

    this.createRecord({
      type_id: contactType.id,
      org_id: orgId,
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1-555-0456',
        company: 'Tech Solutions',
        notes: 'Potential partner',
      },
    }, userId);

    this.createRecord({
      type_id: taskType.id,
      org_id: orgId,
      data: {
        title: 'Review proposal',
        description: 'Review the Q1 proposal and provide feedback',
        status: 'in_progress',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    }, userId);

    this.createRecord({
      type_id: taskType.id,
      org_id: orgId,
      data: {
        title: 'Update documentation',
        description: 'Update API documentation for new features',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    }, userId);
  }
}

// Singleton instance
export const recordsStore = new InMemoryRecordsStore();
