import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // We'll generate DTS separately
  clean: true,
  sourcemap: true,
  external: ['zod'],
});
