import { describe, it, expect, vi, afterEach } from 'vitest';
import { logUsageEvent } from '../../utils/usage';

const payload = { event: 'test', org_id: 'org-1', user_id: 'user-1' };

describe('logUsageEvent', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    consoleError.mockClear();
  });

  it('returns early when no logger is provided', () => {
    logUsageEvent({} as any, payload);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('logs synchronous errors without throwing', () => {
    const logger = vi.fn(() => {
      throw new Error('sync failure');
    });

    expect(() => logUsageEvent({ usageLogger: logger } as any, payload)).not.toThrow();
    expect(consoleError).toHaveBeenCalledWith(
      'Usage logging threw synchronously',
      expect.any(Error),
    );
  });

  it('captures async rejections from logger promises', async () => {
    const logger = vi.fn(() => Promise.reject(new Error('async failure')));

    logUsageEvent({ usageLogger: logger } as any, payload);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(logger).toHaveBeenCalledWith(payload);
    expect(consoleError).toHaveBeenCalledWith('Usage logging failed', expect.any(Error));
  });

  it('passes through successful promise-based loggers', async () => {
    const logger = vi.fn(() => Promise.resolve());

    logUsageEvent({ usageLogger: logger } as any, payload);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(logger).toHaveBeenCalledWith(payload);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
