'use client';

/**
 * Query History Hook
 * Manages query history in localStorage
 */

import { useState, useEffect, useCallback } from 'react';

export interface QueryHistoryItem {
  id: string;
  query: string;
  executedAt: string;
  duration: number;
  rowCount: number;
  status: 'success' | 'error';
  error?: string;
}

const STORAGE_KEY = 'database-console-query-history';
const MAX_HISTORY_ITEMS = 10;

export function useQueryHistory() {
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading query history:', error);
    }
  }, []);

  // Add a new query to history
  const addToHistory = useCallback((item: Omit<QueryHistoryItem, 'id' | 'executedAt'>) => {
    const newItem: QueryHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      executedAt: new Date().toISOString(),
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving query history:', error);
      }
      return updated;
    });
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing query history:', error);
    }
  }, []);

  // Remove a specific item from history
  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error updating query history:', error);
      }
      return updated;
    });
  }, []);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}
