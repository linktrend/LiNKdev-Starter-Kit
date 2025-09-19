import { render, screen } from '@testing-library/react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/src/components/ui/alert';
import { Spinner } from '@/src/components/ui/spinner';
import React from 'react';

describe('UI Primitives', () => {
  describe('Button', () => {
    it('renders with default variant and size', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('renders with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button', { name: /secondary/i });
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('renders with outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button', { name: /outline/i });
      expect(button).toHaveClass('border', 'border-input');
    });

    it('renders with ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button', { name: /ghost/i });
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('renders with destructive variant', () => {
      render(<Button variant="destructive">Destructive</Button>);
      const button = screen.getByRole('button', { name: /destructive/i });
      expect(button).toHaveClass('bg-danger', 'text-danger-foreground');
    });

    it('renders with different sizes', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button', { name: /small/i });
      expect(button).toHaveClass('h-9');
    });
  });

  describe('Badge', () => {
    it('renders with default variant', () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('renders with secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      const badge = screen.getByText('Secondary');
      expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('renders with success variant', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge).toHaveClass('bg-success', 'text-success-foreground');
    });

    it('renders with warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText('Warning');
      expect(badge).toHaveClass('bg-warning', 'text-warning-foreground');
    });

    it('renders with danger variant', () => {
      render(<Badge variant="danger">Danger</Badge>);
      const badge = screen.getByText('Danger');
      expect(badge).toHaveClass('bg-danger', 'text-danger-foreground');
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
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(screen.getByText('Alert description')).toBeInTheDocument();
    });

    it('renders with success variant', () => {
      render(
        <Alert variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Operation completed successfully</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-success/50', 'text-success-foreground');
    });

    it('renders with warning variant', () => {
      render(
        <Alert variant="warning">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Please check your input</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-warning/50', 'text-warning-foreground');
    });

    it('renders with danger variant', () => {
      render(
        <Alert variant="danger">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-danger/50', 'text-danger-foreground');
    });
  });

  describe('Spinner', () => {
    it('renders with default size', () => {
      render(<Spinner />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('h-6', 'w-6');
    });

    it('renders with different sizes', () => {
      render(<Spinner size="sm" />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-4', 'w-4');
    });

    it('renders with text', () => {
      render(<Spinner text="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
