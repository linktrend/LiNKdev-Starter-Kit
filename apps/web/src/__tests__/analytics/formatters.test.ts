import { describe, it, expect } from 'vitest';
import { formatNumber, formatBytes, formatDuration, formatPercentage, getDateRangeLabel } from '../../lib/analytics/formatters';

describe('Analytics Formatters', () => {
  describe('formatNumber', () => {
    it('formats small numbers correctly', () => {
      expect(formatNumber(123)).toBe('123');
      expect(formatNumber(999)).toBe('999');
    });

    it('formats thousands with k', () => {
      expect(formatNumber(1000)).toBe('1.0k');
      expect(formatNumber(1500)).toBe('1.5k');
      expect(formatNumber(10500)).toBe('10.5k');
    });

    it('formats millions with M', () => {
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(1500000)).toBe('1.5M');
    });
  });

  describe('formatBytes', () => {
    it('formats bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatBytes(1024 * 1024 * 1024 * 1.5)).toBe('1.5 GB');
    });
  });

  describe('formatDuration', () => {
    it('formats ms correctly', () => {
      expect(formatDuration(500)).toBe('500ms');
    });
    it('formats seconds correctly', () => {
      expect(formatDuration(1500)).toBe('1.5s');
      expect(formatDuration(1000)).toBe('1.0s');
    });
    it('formats minutes correctly', () => {
      expect(formatDuration(60000)).toBe('1.0m');
      expect(formatDuration(90000)).toBe('1.5m');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage correctly', () => {
      expect(formatPercentage(12.345)).toBe('12.3%');
      expect(formatPercentage(0)).toBe('0.0%');
      expect(formatPercentage(100)).toBe('100.0%');
    });
  });

  describe('getDateRangeLabel', () => {
    it('formats date range correctly', () => {
      const from = new Date('2023-01-01T00:00:00.000Z');
      const to = new Date('2023-01-31T00:00:00.000Z');
      expect(getDateRangeLabel(from, to)).toBe('Jan 1, 2023 - Jan 31, 2023');
    });
  });
});
