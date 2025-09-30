import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // Disable DTS generation for now
  external: [
    '@/utils/cn',
    '@/lib/utils',
    '@/components/ui/button',
    '@/components/ui/dialog',
    '@/components/ui/label',
    '@/components/ui/toggle',
    '@/components/ui/toast',
    '@/components/ui/use-toast',
    '@starter/ui', // Mark self as external to avoid circular dependency
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
});
