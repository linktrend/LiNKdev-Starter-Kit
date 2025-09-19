import designTokens from '../design/DESIGN_TOKENS.json';

describe('Design Tokens', () => {
  it('should have all required color tokens', () => {
    expect(designTokens.color).toBeDefined();
    expect(designTokens.color.background).toBeDefined();
    expect(designTokens.color.foreground).toBeDefined();
    expect(designTokens.color.primary).toBeDefined();
    expect(designTokens.color.secondary).toBeDefined();
    expect(designTokens.color.muted).toBeDefined();
    expect(designTokens.color.border).toBeDefined();
    expect(designTokens.color.ring).toBeDefined();
    expect(designTokens.color.success).toBeDefined();
    expect(designTokens.color.warning).toBeDefined();
    expect(designTokens.color.danger).toBeDefined();
  });

  it('should have light and dark variants for colors', () => {
    const colorKeys = Object.keys(designTokens.color);
    
    colorKeys.forEach(colorKey => {
      const color = designTokens.color[colorKey as keyof typeof designTokens.color];
      if (typeof color === 'object' && color !== null) {
        expect(color.light).toBeDefined();
        expect(color.dark).toBeDefined();
      }
    });
  });

  it('should have all required radius tokens', () => {
    expect(designTokens.radius).toBeDefined();
    expect(designTokens.radius.sm).toBeDefined();
    expect(designTokens.radius.md).toBeDefined();
    expect(designTokens.radius.lg).toBeDefined();
    expect(designTokens.radius.xl).toBeDefined();
    expect(designTokens.radius.pill).toBeDefined();
  });

  it('should have all required shadow tokens', () => {
    expect(designTokens.shadow).toBeDefined();
    expect(designTokens.shadow.sm).toBeDefined();
    expect(designTokens.shadow.md).toBeDefined();
    expect(designTokens.shadow.lg).toBeDefined();
  });

  it('should have all required space tokens', () => {
    expect(designTokens.space).toBeDefined();
    expect(designTokens.space[2]).toBeDefined();
    expect(designTokens.space[4]).toBeDefined();
    expect(designTokens.space[6]).toBeDefined();
    expect(designTokens.space[8]).toBeDefined();
    expect(designTokens.space[12]).toBeDefined();
    expect(designTokens.space[16]).toBeDefined();
    expect(designTokens.space[24]).toBeDefined();
  });

  it('should have all required font tokens', () => {
    expect(designTokens.font).toBeDefined();
    expect(designTokens.font.sans).toBeDefined();
    expect(designTokens.font.mono).toBeDefined();
    expect(designTokens.font.size).toBeDefined();
    expect(designTokens.font.weight).toBeDefined();
  });

  it('should have all required font size tokens', () => {
    expect(designTokens.font.size.xs).toBeDefined();
    expect(designTokens.font.size.sm).toBeDefined();
    expect(designTokens.font.size.base).toBeDefined();
    expect(designTokens.font.size.lg).toBeDefined();
    expect(designTokens.font.size.xl).toBeDefined();
    expect(designTokens.font.size['2xl']).toBeDefined();
    expect(designTokens.font.size['3xl']).toBeDefined();
  });

  it('should have all required font weight tokens', () => {
    expect(designTokens.font.weight.regular).toBeDefined();
    expect(designTokens.font.weight.medium).toBeDefined();
    expect(designTokens.font.weight.semibold).toBeDefined();
  });

  it('should have all required z-index tokens', () => {
    expect(designTokens.z).toBeDefined();
    expect(designTokens.z.dropdown).toBeDefined();
    expect(designTokens.z.modal).toBeDefined();
    expect(designTokens.z.toast).toBeDefined();
  });

  it('should have valid radius values', () => {
    expect(designTokens.radius.sm).toBe('0.25rem');
    expect(designTokens.radius.md).toBe('0.375rem');
    expect(designTokens.radius.lg).toBe('0.5rem');
    expect(designTokens.radius.xl).toBe('0.75rem');
    expect(designTokens.radius.pill).toBe('9999px');
  });

  it('should have valid space values', () => {
    expect(designTokens.space[2]).toBe('0.5rem');
    expect(designTokens.space[4]).toBe('1rem');
    expect(designTokens.space[6]).toBe('1.5rem');
    expect(designTokens.space[8]).toBe('2rem');
    expect(designTokens.space[12]).toBe('3rem');
    expect(designTokens.space[16]).toBe('4rem');
    expect(designTokens.space[24]).toBe('6rem');
  });

  it('should have valid font weight values', () => {
    expect(designTokens.font.weight.regular).toBe('400');
    expect(designTokens.font.weight.medium).toBe('500');
    expect(designTokens.font.weight.semibold).toBe('600');
  });

  it('should have valid z-index values', () => {
    expect(designTokens.z.dropdown).toBe('1000');
    expect(designTokens.z.modal).toBe('1050');
    expect(designTokens.z.toast).toBe('1100');
  });
});
