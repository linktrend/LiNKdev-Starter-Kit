import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SupportWidget } from '@/components/support-widget';

describe('SupportWidget', () => {

  it('renders chat bubble icon', () => {
    render(<SupportWidget orgId="test-org-123" />);
    
    // Check if the chat bubble icon is rendered
    const chatIcon = screen.getByRole('button', { name: /open customer support chat/i });
    expect(chatIcon).toBeInTheDocument();
  });

  it('initializes with orgId', () => {
    render(<SupportWidget orgId="test-org-123" />);
    
    // Check if the component renders without errors
    const chatIcon = screen.getByRole('button', { name: /open customer support chat/i });
    expect(chatIcon).toBeInTheDocument();
  });

  it('initializes without orgId', () => {
    render(<SupportWidget />);
    
    // Check if the component renders without errors
    const chatIcon = screen.getByRole('button', { name: /open customer support chat/i });
    expect(chatIcon).toBeInTheDocument();
  });

  it('handles click events', () => {
    render(<SupportWidget orgId="test-org-123" />);
    
    const chatIcon = screen.getByRole('button', { name: /open customer support chat/i });
    
    // Simulate click - should not throw errors
    expect(() => chatIcon.click()).not.toThrow();
  });

  it('handles keyboard events', () => {
    render(<SupportWidget orgId="test-org-123" />);
    
    const chatIcon = screen.getByRole('button', { name: /open customer support chat/i });
    
    // Simulate Enter key press using fireEvent - should not throw errors
    expect(() => fireEvent.keyDown(chatIcon, { key: 'Enter' })).not.toThrow();
  });
});
