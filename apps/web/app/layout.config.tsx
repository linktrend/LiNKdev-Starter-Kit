import { type BaseLayoutProps, type DocsLayoutProps } from 'fumadocs-ui/layout';

// shared configuration
export const baseOptions: BaseLayoutProps = {
  links: [
    {
      text: 'Documentation',
      url: '/docs',
      active: 'nested-url'
    }
  ]
};

// docs layout configuration
export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: {
    name: 'Documentation',
    children: []
  }
};
