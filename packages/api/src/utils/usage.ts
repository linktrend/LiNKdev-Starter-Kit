import type { UsageLogPayload } from '@starter/types';
import type { TRPCContext } from '../context';

export function logUsageEvent(ctx: Pick<TRPCContext, 'usageLogger'>, payload: UsageLogPayload) {
  if (!ctx.usageLogger) return;
  try {
    const result = ctx.usageLogger(payload);
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      (result as Promise<unknown>).catch((error) => {
        console.error('Usage logging failed', error);
      });
    }
  } catch (error) {
    console.error('Usage logging threw synchronously', error);
  }
}
