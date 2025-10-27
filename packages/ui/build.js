import { build } from 'esbuild';
import { readFileSync } from 'fs';
import { join } from 'path';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  outfile: 'dist/index.js',
  sourcemap: true,
  banner: {
    js: '"use client";',
  },
  external: [
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
    '@/lib/utils',
    '@/utils/cn',
    '@/components/ui/button',
    '@/components/ui/dialog',
    '@/components/ui/label',
    '@/components/ui/toggle',
    '@/components/ui/toast',
    '@/components/ui/use-toast',
    '@starter/ui',
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  minify: false,
  splitting: false,
  metafile: true,
  write: true,
  logLevel: 'info',
}).catch(() => process.exit(1));
