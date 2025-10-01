import { getPages } from '@/utils/source';
import { createSearchAPI } from 'fumadocs-core/search/server';

// Temporarily disable search API due to build issues
export const { GET } = createSearchAPI('advanced', {
  indexes: []
});
