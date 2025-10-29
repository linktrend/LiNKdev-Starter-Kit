'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronRight, HelpCircle, Book, Video, Send, MessageCircle, Phone } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUserDocs?: () => void;
  onOpenVideoTutorials?: () => void;
  onOpenSupportTicket?: () => void;
  onOpenLiveChat?: () => void;
  onOpenScheduleCall?: () => void;
}

export default function FAQModal({ 
  isOpen, 
  onClose, 
  onOpenUserDocs, 
  onOpenVideoTutorials, 
  onOpenSupportTicket, 
  onOpenLiveChat, 
  onOpenScheduleCall 
}: FAQModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const faqs: FAQ[] = [
    // Account & Login
    {
      id: 'account-setup',
      question: 'How do I create an account?',
      answer: 'To create an account, click the "Sign Up" button on our homepage. You\'ll need to provide your email address, create a password, and verify your email. Once verified, you can complete your profile setup.',
      category: 'Account & Login'
    },
    {
      id: 'password-reset',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a password reset link via email. Follow the instructions in the email to create a new password.',
      category: 'Account & Login'
    },
    {
      id: 'two-factor-auth',
      question: 'How do I enable two-factor authentication?',
      answer: 'Go to Account Settings > Security tab and click "Enable Two-Factor Authentication". Follow the setup instructions to link your authenticator app. This adds an extra layer of security to your account.',
      category: 'Account & Login'
    },

    // Getting Started
    {
      id: 'first-steps',
      question: 'What should I do after creating my account?',
      answer: 'After account creation, complete your profile, explore the dashboard, and check out our getting started guide. We recommend watching the introductory video tutorial and setting up your first project.',
      category: 'Getting Started'
    },
    {
      id: 'dashboard-overview',
      question: 'How do I navigate the dashboard?',
      answer: 'The dashboard is your central hub. Use the sidebar to navigate between sections, the top bar for quick actions, and the main area to view your projects, tasks, and recent activity.',
      category: 'Getting Started'
    },
    {
      id: 'profile-setup',
      question: 'How do I complete my profile?',
      answer: 'Click on your profile picture in the top-right corner, then select "Profile Settings". Add your name, profile picture, timezone, and other preferences to personalize your experience.',
      category: 'Getting Started'
    },

    // Projects & Tasks
    {
      id: 'create-project',
      question: 'How do I create a new project?',
      answer: 'Click "New Project" from the dashboard or projects page. Enter the project name, description, set a start date, and assign team members. Configure project settings and click "Create Project".',
      category: 'Projects & Tasks'
    },
    {
      id: 'assign-tasks',
      question: 'How do I assign tasks to team members?',
      answer: 'Open your project and click "Add Task". Fill in the task details, select assignees from the dropdown, set due dates, and add any relevant files or comments.',
      category: 'Projects & Tasks'
    },
    {
      id: 'track-progress',
      question: 'How can I track project progress?',
      answer: 'Use the project dashboard to view progress bars, task completion rates, and timeline updates. Generate reports from the Reports section to get detailed insights into team performance.',
      category: 'Projects & Tasks'
    },

    // Billing & Subscription
    {
      id: 'billing-cycle',
      question: 'When will I be charged?',
      answer: 'You\'ll be charged on the same date each month/year based on when you first subscribed. You can view your billing cycle and next payment date in Account Settings > Billing.',
      category: 'Billing & Subscription'
    },
    {
      id: 'upgrade-plan',
      question: 'How do I upgrade my subscription plan?',
      answer: 'Go to Account Settings > Billing and click "Upgrade Plan". Select your desired plan and follow the payment process. Changes take effect immediately.',
      category: 'Billing & Subscription'
    },
    {
      id: 'cancel-subscription',
      question: 'How do I cancel my subscription?',
      answer: 'In Account Settings > Billing, click "Cancel Subscription". You\'ll retain access until the end of your current billing period. Contact support if you need assistance.',
      category: 'Billing & Subscription'
    },

    // Technical Issues
    {
      id: 'browser-compatibility',
      question: 'Which browsers are supported?',
      answer: 'We support Chrome, Firefox, Safari, and Edge (latest 2 versions). Ensure JavaScript is enabled and cookies are allowed. For best performance, use Chrome or Firefox.',
      category: 'Technical Issues'
    },
    {
      id: 'slow-loading',
      question: 'The platform is loading slowly. What should I do?',
      answer: 'Try refreshing the page, clearing your browser cache, or using a different browser. Check your internet connection and disable browser extensions temporarily. Contact support if issues persist.',
      category: 'Technical Issues'
    },
    {
      id: 'upload-problems',
      question: 'I can\'t upload files. What\'s wrong?',
      answer: 'Check file size limits (max 100MB per file), ensure your internet connection is stable, and verify the file format is supported. Try uploading smaller files first to test connectivity.',
      category: 'Technical Issues'
    },

    // Security & Privacy
    {
      id: 'data-security',
      question: 'How is my data protected?',
      answer: 'We use industry-standard encryption, secure servers, and regular security audits. Your data is encrypted in transit and at rest. We comply with SOC 2, GDPR, and other security standards.',
      category: 'Security & Privacy'
    },
    {
      id: 'data-export',
      question: 'Can I export my data?',
      answer: 'Yes, you can export your data anytime from Account Settings > Data Export. Choose the format (JSON, CSV) and data range. Large exports may take time to process.',
      category: 'Security & Privacy'
    },
    {
      id: 'account-deletion',
      question: 'How do I delete my account?',
      answer: 'Go to Account Settings > Privacy and click "Delete Account". This action is irreversible and will permanently remove all your data. Contact support if you need assistance.',
      category: 'Security & Privacy'
    }
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const filteredFAQs = selectedCategory 
    ? faqs.filter(faq => faq.category === selectedCategory)
    : [];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="w-full max-w-4xl h-[80vh] overflow-hidden rounded-lg border shadow-2xl modal-bg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">Frequently Asked Questions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-all"
          >
            <X className="h-5 w-5 text-muted-foreground/70" />
          </button>
        </div>

        <div className="p-6 h-[calc(80vh-120px)] overflow-y-auto">
          {/* Category Selection */}
          <div className="mb-6">
            <label htmlFor="category-select" className="block text-sm font-medium text-muted-foreground mb-2">
              Select a category to view FAQs
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full max-w-md p-3 border border-border rounded-lg bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Choose a category...</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* FAQs List */}
          {selectedCategory && (
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                {selectedCategory} FAQs
              </h3>
              {filteredFAQs.map((faq) => {
                const isExpanded = expandedQuestions.has(faq.id);
                
                return (
                  <div
                    key={faq.id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleQuestion(faq.id)}
                      className="w-full p-4 text-left hover:bg-muted transition-all flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-card-foreground pr-4">
                        {faq.question}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border bg-muted/20">
                        <p className="text-sm text-muted-foreground leading-relaxed pt-4">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Help Links */}
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Didn't find an answer to your question? Check our{' '}
              <button 
                onClick={() => {
                  onClose();
                  onOpenUserDocs?.();
                }}
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <Book className="h-3 w-3" />
                user documentation
              </button>{' '}
              or{' '}
              <button 
                onClick={() => {
                  onClose();
                  onOpenVideoTutorials?.();
                }}
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <Video className="h-3 w-3" />
                video tutorials
              </button>
              . Please contact support by{' '}
              <button 
                onClick={() => {
                  onClose();
                  onOpenSupportTicket?.();
                }}
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <Send className="h-3 w-3" />
                submit support ticket
              </button>
              ,{' '}
              <button 
                onClick={() => {
                  onClose();
                  onOpenLiveChat?.();
                }}
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <MessageCircle className="h-3 w-3" />
                live chat
              </button>
              {' '}or{' '}
              <button 
                onClick={() => {
                  onClose();
                  onOpenScheduleCall?.();
                }}
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <Phone className="h-3 w-3" />
                schedule a call
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
