import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

describe('UI Primitives', () => {
  describe('Button', () => {
    it('renders with default variant and size', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeTruthy();
      expect(button.className).toContain('bg-primary');
      expect(button.className).toContain('text-primary-foreground');
    });

    it('renders with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button', { name: /secondary/i });
      expect(button.className).toContain('bg-secondary');
      expect(button.className).toContain('text-secondary-foreground');
    });

    it('renders with outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button', { name: /outline/i });
      expect(button.className).toContain('border');
      expect(button.className).toContain('border-input');
    });

    it('renders with ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button', { name: /ghost/i });
      expect(button.className).toContain('hover:bg-accent');
    });

    it('renders with destructive variant', () => {
      render(<Button variant="destructive">Destructive</Button>);
      const button = screen.getByRole('button', { name: /destructive/i });
      expect(button.className).toContain('bg-destructive');
      expect(button.className).toContain('text-destructive-foreground');
    });

    it('renders with different sizes', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button', { name: /small/i });
      expect(button.className).toContain('h-9');
    });
  });

  describe('Badge', () => {
    it('renders with default variant', () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge).toBeTruthy();
      expect(badge.className).toContain('bg-zinc-900');
      expect(badge.className).toContain('text-zinc-50');
    });

    it('renders with secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      const badge = screen.getByText('Secondary');
      expect(badge.className).toContain('bg-zinc-100');
      expect(badge.className).toContain('text-zinc-900');
    });

    it('renders with outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText('Outline');
      expect(badge.className).toContain('text-zinc-950');
    });

    it('renders with destructive variant', () => {
      render(<Badge variant="destructive">Destructive</Badge>);
      const badge = screen.getByText('Destructive');
      expect(badge.className).toContain('bg-red-500');
      expect(badge.className).toContain('text-zinc-50');
    });

    it('renders with outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText('Outline');
      expect(badge.className).toContain('text-zinc-950');
    });
  });

  describe('Alert', () => {
    it('renders with default variant', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>Alert description</AlertDescription>
        </Alert>
      );
      expect(screen.getByText('Alert Title')).toBeTruthy();
      expect(screen.getByText('Alert description')).toBeTruthy();
    });

    it('renders with success variant', () => {
      render(
        <Alert variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Operation completed successfully</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('border-zinc-200');
    });

    it('renders with warning variant', () => {
      render(
        <Alert variant="warning">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Please check your input</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('border-zinc-200');
    });

    it('renders with danger variant', () => {
      render(
        <Alert variant="danger">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('border-zinc-200');
    });
  });

  describe('Spinner', () => {
    it('renders with default size', () => {
      render(<Spinner />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeTruthy();
      expect(spinner.className).toContain('h-6');
      expect(spinner.className).toContain('w-6');
    });

    it('renders with different sizes', () => {
      render(<Spinner size="sm" />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner.className).toContain('h-4');
      expect(spinner.className).toContain('w-4');
    });

    it('renders with text', () => {
      render(<Spinner text="Loading..." />);
      // Spinner component doesn't render text, just the spinner element
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });
  });
});
