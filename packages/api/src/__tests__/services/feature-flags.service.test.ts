import { describe, it, expect } from 'vitest';
import {
  MockFeatureFlagsService,
  featureFlagsService,
} from '../../services/feature-flags.service';

describe('MockFeatureFlagsService', () => {
  it('returns default flag state for a single flag', async () => {
    const service = new MockFeatureFlagsService();

    const result = await service.getFeatureFlag('org-1', 'BILLING_FEATURE_ENABLED');

    expect(result).toEqual({
      name: 'BILLING_FEATURE_ENABLED',
      isEnabled: false,
    });
  });

  it('returns all flags with defaults', async () => {
    const service = new MockFeatureFlagsService();

    const result = await service.getAllFeatureFlags('org-1');

    expect(result).toHaveLength(7);
    expect(result.find((f) => f.name === 'RECORDS_FEATURE_ENABLED')?.isEnabled).toBe(true);
    expect(result.find((f) => f.name === 'BETA_FEATURES_ENABLED')?.isEnabled).toBe(false);
  });

  it('exposes a singleton instance', async () => {
    const flag = await featureFlagsService.getFeatureFlag('org-1', 'AUDIT_FEATURE_ENABLED');
    expect(flag.isEnabled).toBe(true);
  });
});
