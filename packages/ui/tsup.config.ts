import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  platform: 'browser',
  treeshake: true,
  minify: false,
  external: [
    '@/utils/cn',
    '@/lib/utils',
    '@/components/ui/button',
    '@/components/ui/dialog',
    '@/components/ui/label',
    '@/components/ui/toggle',
    '@/components/ui/toast',
    '@/components/ui/use-toast',
    '@starter/ui',
    'react',
    'react-dom',
    'react-native',
    'nativewind',
    'react/jsx-runtime',
    'use-callback-ref',
    '@floating-ui/react-dom',
    'react-day-picker',
    'date-fns',
    'embla-carousel-react',
    'embla-carousel-reactive-utils',
  ],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
    options.format = 'esm';
    options.bundle = true;
    options.splitting = false;
  },
});
