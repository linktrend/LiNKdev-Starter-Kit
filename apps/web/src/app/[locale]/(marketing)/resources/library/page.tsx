'use client';

import { ResourcePageLayout } from '@/components/layouts/ResourcePageLayout';
import { useState } from 'react';
import { FileText, ChevronDown, ChevronRight, Video, ExternalLink, Book, Code, Github, Youtube } from 'lucide-react';
import Link from 'next/link';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function LibraryPage() {
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

  const filteredFAQs = selectedCategory 
    ? faqs.filter(faq => faq.category === selectedCategory)
    : [];

  const videoTutorials = [
    {
      id: '1',
      title: 'Getting Started - Platform Overview',
      duration: '5:30',
      description: 'Learn the basics of navigating the platform and setting up your account',
      thumbnail: '/placeholder-video.jpg',
      url: 'https://www.youtube.com/watch?v=example1'
    },
    {
      id: '2',
      title: 'Creating Your First Project',
      duration: '8:45',
      description: 'Step-by-step guide to creating and configuring your first project',
      thumbnail: '/placeholder-video.jpg',
      url: 'https://www.youtube.com/watch?v=example2'
    },
    {
      id: '3',
      title: 'Team Collaboration Features',
      duration: '12:20',
      description: 'Discover how to collaborate effectively with your team members',
      thumbnail: '/placeholder-video.jpg',
      url: 'https://www.youtube.com/watch?v=example3'
    },
    {
      id: '4',
      title: 'Advanced Features & Integrations',
      duration: '15:00',
      description: 'Explore advanced features and third-party integrations',
      thumbnail: '/placeholder-video.jpg',
      url: 'https://www.youtube.com/watch?v=example4'
    }
  ];

  const thirdPartyResources = [
    {
      id: '1',
      title: 'Official Documentation',
      description: 'Complete API reference and developer guides',
      icon: <Book className="h-6 w-6" />,
      url: 'https://docs.example.com',
      type: 'Documentation'
    },
    {
      id: '2',
      title: 'GitHub Repository',
      description: 'View source code, report issues, and contribute',
      icon: <Github className="h-6 w-6" />,
      url: 'https://github.com/example/repo',
      type: 'Code'
    },
    {
      id: '3',
      title: 'Community Forum',
      description: 'Ask questions and connect with other users',
      icon: <FileText className="h-6 w-6" />,
      url: 'https://community.example.com',
      type: 'Community'
    },
    {
      id: '4',
      title: 'YouTube Channel',
      description: 'Video tutorials and product updates',
      icon: <Youtube className="h-6 w-6" />,
      url: 'https://youtube.com/@example',
      type: 'Video'
    },
    {
      id: '5',
      title: 'Code Examples',
      description: 'Sample projects and implementation guides',
      icon: <Code className="h-6 w-6" />,
      url: 'https://examples.example.com',
      type: 'Code'
    },
    {
      id: '6',
      title: 'Blog & Updates',
      description: 'Latest news, tips, and best practices',
      icon: <FileText className="h-6 w-6" />,
      url: 'https://blog.example.com',
      type: 'Blog'
    }
  ];

  const headerFaqSection = (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
        <p className="text-muted-foreground">
          Find answers to common questions about using our platform
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="category-select" className="block text-sm font-medium text-muted-foreground mb-2">
          Select a category to view FAQs
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full max-w-md p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Choose a category...</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory ? (
        <div className="space-y-3">
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
                  <span className="text-sm font-medium text-foreground pr-4">
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
      ) : (
        <p className="text-sm text-muted-foreground">
          Choose a category to see relevant questions and answers.
        </p>
      )}
    </div>
  );

  return (
    <ResourcePageLayout
      title="Resource Library"
      subtitle="Everything you need to succeed with our platform"
      headerContent={headerFaqSection}
      mainContent={
        <div className="space-y-16">
          {/* Video Tutorials Section */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Video Tutorials</h2>
              <p className="text-muted-foreground">
                Watch step-by-step tutorials to learn how to use our platform effectively
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videoTutorials.map((video) => (
                <div
                  key={video.id}
                  className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video bg-muted flex items-center justify-center">
                    <Video className="h-16 w-16 text-muted-foreground/30" />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {video.description}
                    </p>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
                    >
                      Watch Video
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Third-Party Resources Section */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Third-Party Resources</h2>
              <p className="text-muted-foreground">
                Explore additional resources from our community and partners
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {thirdPartyResources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-6 bg-background rounded-lg border hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                    {resource.icon}
                  </div>
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                      {resource.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {resource.description}
                  </p>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
                  >
                    Visit Resource
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}
