import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'next', '@supabase/supabase-js', '@supabase/ssr', '@supabase/auth-helpers-nextjs'],
  treeshake: true,
  splitting: false,
});
