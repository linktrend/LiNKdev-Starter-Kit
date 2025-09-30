import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { SupportWidget } from '@/components/support-widget';

// Mock console.log to capture initialization messages
const mockConsoleLog = vi.fn();
global.console.log = mockConsoleLog;

describe('SupportWidget', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  it('renders chat bubble icon', () => {
    render(<SupportWidget orgId="test-org-123" />);
    
    // Check if the chat bubble icon is rendered
    const chatIcon = screen.getByRole('button', { name: /open customer support chat/i });
    expect(chatIcon).toBeInTheDocument();
  });

  it('logs initialization message with orgId', () => {
    render(<SupportWidget orgId="test-org-123" />);
    
    // Check if the initialization message was logged
    expect(mockConsoleLog).toHaveBeenCalledWith('Support Widget Initialized for Org: test-org-123');
  });

  it('logs initialization message with unknown when no orgId', () => {
    render(<SupportWidget />);
    
    // Check if the initialization message was logged with 'unknown'
    expect(mockConsoleLog).toHaveBeenCalledWith('Support Widget Initialized for Org: unknown');
  });

  it('handles click events', () => {
    render(<SupportWidget orgId="test-org-123" />);
    
    const chatIcon = screen.getByRole('button', { name: /open customer support chat/i });
    
    // Simulate click
    chatIcon.click();
    
    // Check if click message was logged
    expect(mockConsoleLog).toHaveBeenCalledWith('Support Widget clicked - would open chat interface');
  });

  it('handles keyboard events', () => {
    render(<SupportWidget orgId="test-org-123" />);
    
    const chatIcon = screen.getByRole('button', { name: /open customer support chat/i });
    
    // Simulate Enter key press using fireEvent
    fireEvent.keyDown(chatIcon, { key: 'Enter' });
    
    // Check if keyboard activation message was logged
    expect(mockConsoleLog).toHaveBeenCalledWith('Support Widget activated via keyboard - would open chat interface');
  });
});
