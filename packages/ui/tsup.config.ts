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
    'use-sync-external-store',
    '@floating-ui/react-dom',
    'react-day-picker',
    'date-fns',
    'embla-carousel-react',
    'embla-carousel-reactive-utils',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-select',
    '@radix-ui/react-slot',
    '@radix-ui/react-toast',
    '@radix-ui/react-tooltip',
  ],
  noExternal: [], // Don't bundle any dependencies
  treeshake: true,
  splitting: false,
  clean: true,
});
