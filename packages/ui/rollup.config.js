import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'esm',
    banner: '"use client";',
    sourcemap: true,
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
  plugins: [
    nodeResolve({
      preferBuiltins: false,
    }),
    commonjs({
      include: /node_modules/,
    }),
    typescript({
      tsconfig: './tsconfig.json',
    }),
  ],
});
