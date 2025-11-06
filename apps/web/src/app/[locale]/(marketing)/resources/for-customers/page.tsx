'use client';

import { ResourcePageLayout } from '@/components/layouts/ResourcePageLayout';
import { useState } from 'react';
import { FileText, ChevronDown, ChevronRight, Eye } from 'lucide-react';
import Link from 'next/link';

interface Document {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
}

export default function ForCustomersPage() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Basics']));

  const documents: Document[] = [
    {
      id: 'getting-started',
      title: 'Getting Started Guide',
      description: 'Learn the basics of using our platform',
      category: 'Basics',
      content: `# Getting Started Guide

Welcome to our platform! This guide will help you get up and running quickly.

## First Steps

1. **Account Setup**: Complete your profile information
2. **Dashboard Overview**: Familiarize yourself with the main interface
3. **Basic Navigation**: Learn how to move around the platform

## Key Features

- **Dashboard**: Your central hub for all activities
- **Projects**: Create and manage your projects
- **Settings**: Customize your experience
- **Help**: Access support and documentation

## Next Steps

Once you're comfortable with the basics, explore our advanced features and integrations.

For additional help, contact our support team or check out our video tutorials.`
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'How to manage users and permissions',
      category: 'Administration',
      content: `# User Management

This guide covers user management features and best practices.

## Adding Users

1. Navigate to the Users section
2. Click "Add New User"
3. Fill in user details
4. Assign appropriate roles
5. Send invitation

## User Roles

- **Admin**: Full system access
- **Manager**: Project and team management
- **User**: Basic platform access
- **Viewer**: Read-only access

## Permissions

Each role has specific permissions:
- Create/Edit projects
- Manage team members
- Access reports
- System configuration

## Best Practices

- Regularly review user access
- Use principle of least privilege
- Monitor user activity
- Keep user information updated`
    },
    {
      id: 'project-management',
      title: 'Project Management',
      description: 'Complete guide to managing projects',
      category: 'Features',
      content: `# Project Management

Learn how to effectively manage projects on our platform.

## Creating Projects

1. Click "New Project" button
2. Enter project details:
   - Project name
   - Description
   - Start date
   - Team members
3. Configure project settings
4. Save and launch

## Project Lifecycle

- **Planning**: Define scope and requirements
- **Execution**: Track progress and milestones
- **Monitoring**: Review metrics and reports
- **Completion**: Finalize and archive

## Collaboration Features

- Real-time updates
- Comment system
- File sharing
- Task assignments
- Progress tracking

## Reporting

Access detailed reports on:
- Project progress
- Team performance
- Resource utilization
- Timeline adherence`
    },
    {
      id: 'api-integration',
      title: 'API Integration',
      description: 'How to integrate with our API',
      category: 'Technical',
      content: `# API Integration Guide

Connect your applications with our platform using our REST API.

## Authentication

All API requests require authentication using API keys:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://api.platform.com/v1/endpoint
\`\`\`

## Rate Limits

- 1000 requests per hour per API key
- Burst limit: 100 requests per minute
- Rate limit headers included in responses

## Common Endpoints

### Users
- \`GET /users\` - List users
- \`POST /users\` - Create user
- \`PUT /users/{id}\` - Update user

### Projects
- \`GET /projects\` - List projects
- \`POST /projects\` - Create project
- \`GET /projects/{id}\` - Get project details

## Error Handling

API returns standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## SDKs

We provide SDKs for:
- JavaScript/Node.js
- Python
- PHP
- Java`
    },
    {
      id: 'security-guide',
      title: 'Security Best Practices',
      description: 'Security guidelines and recommendations',
      category: 'Security',
      content: `# Security Best Practices

Protect your account and data with these security guidelines.

## Account Security

### Password Requirements
- Minimum 12 characters
- Mix of letters, numbers, and symbols
- Avoid common passwords
- Use unique passwords for each account

### Two-Factor Authentication
Enable 2FA for additional security:
1. Go to Account Settings
2. Security tab
3. Enable Two-Factor Authentication
4. Follow setup instructions

## Data Protection

### Sensitive Data
- Never share login credentials
- Use secure connections (HTTPS)
- Regular data backups
- Encrypt sensitive files

### Access Control
- Review user permissions regularly
- Remove inactive accounts
- Monitor access logs
- Use principle of least privilege

## Platform Security

### Network Security
- Use VPN for remote access
- Avoid public Wi-Fi for sensitive work
- Keep software updated
- Use firewall protection

### Incident Response
If you suspect a security breach:
1. Change passwords immediately
2. Contact support team
3. Review account activity
4. Enable additional security measures

## Compliance

Our platform complies with:
- SOC 2 Type II
- GDPR
- HIPAA (for healthcare data)
- ISO 27001`
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting Guide',
      description: 'Common issues and solutions',
      category: 'Support',
      content: `# Troubleshooting Guide

Resolve common issues quickly with this troubleshooting guide.

## Login Issues

### Can't Access Account
1. Verify email address
2. Check password (case-sensitive)
3. Clear browser cache
4. Try incognito/private mode
5. Contact support if issues persist

### Password Reset
1. Click "Forgot Password"
2. Enter email address
3. Check email for reset link
4. Follow instructions
5. Create new password

## Performance Issues

### Slow Loading
- Check internet connection
- Clear browser cache
- Disable browser extensions
- Try different browser
- Contact support with details

### Upload Problems
- Check file size limits
- Verify file format
- Ensure stable connection
- Try smaller files first

## Feature Issues

### Missing Features
- Check user permissions
- Verify account type
- Update browser
- Clear cache and cookies
- Contact support

### Data Sync Issues
- Refresh the page
- Check internet connection
- Log out and back in
- Clear browser data
- Contact support

## Browser Compatibility

Supported browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Minimum requirements:
- JavaScript enabled
- Cookies enabled
- Modern browser (last 2 versions)

## Getting Help

If you can't resolve the issue:
1. Check this troubleshooting guide
2. Search our knowledge base
3. Contact support team
4. Include error messages and steps to reproduce`
    }
  ];

  const categories = Array.from(new Set(documents.map(doc => doc.category)));

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  const documentationSection = (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">User Documentation</h2>
        <p className="text-muted-foreground">
          Access detailed guides, tutorials, and best practices for using our platform
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 min-h-[560px]">
        <div className="md:w-1/3 border border-border rounded-lg bg-muted/30 p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Documentation</h3>
          <div className="space-y-2">
            {categories.map((category) => {
              const isExpanded = expandedCategories.has(category);
              const categoryDocuments = documents.filter(doc => doc.category === category);

              return (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-all mb-2"
                  >
                    <h4 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">
                      {category}
                    </h4>
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="space-y-1 ml-2 mb-2">
                      {categoryDocuments.map((document) => (
                        <button
                          key={document.id}
                          onClick={() => handleDocumentSelect(document)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedDocument?.id === document.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium">{document.title}</div>
                              <div className={`text-xs mt-1 ${
                                selectedDocument?.id === document.id
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}>
                                {document.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 border border-border rounded-lg bg-background">
          {selectedDocument ? (
            <>
              <div className="p-6 border-b border-border bg-muted/20">
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  {selectedDocument.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDocument.description}
                </p>
              </div>
              <div className="p-6 max-h-[480px] overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                    {selectedDocument.content}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center text-center p-12 h-full">
              <div>
                <Eye className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Select a Document
                </h3>
                <p className="text-sm text-muted-foreground/70">
                  Choose a document from the list to view its contents
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ResourcePageLayout
      title="Resources for Customers"
      subtitle="Comprehensive documentation and support materials for our customers"
      headerContent={documentationSection}
      mainContent={
        <div className="space-y-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
                <h3 className="text-xl font-semibold mb-3">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  Our support team is here to assist you with any questions or issues.
                </p>
                <div className="space-y-2">
                  <Link href="/en/contact" className="block text-primary hover:underline">
                    Contact Support →
                  </Link>
                  <Link href="/en/resources/library" className="block text-primary hover:underline">
                    View FAQ →
                  </Link>
                </div>
              </div>

              <div className="p-6 bg-muted/30 rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Account Management</h3>
                <p className="text-muted-foreground mb-4">
                  Manage your account, billing, and subscription settings.
                </p>
                <div className="space-y-2">
                  <Link href="/en/dashboard" className="block text-primary hover:underline">
                    Go to Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-gradient-to-br from-green-500/10 via-yellow-400/10 to-red-500/10 rounded-lg p-8 h-full flex flex-col gap-4">
          <h3 className="text-xl font-semibold text-foreground">Support System Health</h3>
          <p className="text-sm text-muted-foreground">
            Live service status pulled from the support health console.
          </p>
          <div className="grid gap-3 text-sm text-foreground">
            <div className="rounded-lg border border-border bg-background/80 px-4 py-3 grid grid-cols-[1fr_auto] items-center gap-x-6">
              <span className="font-medium">Phone Support</span>
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground w-36 justify-start">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Operational
              </span>
            </div>

            <div className="rounded-lg border border-border bg-background/80 px-4 py-3 grid grid-cols-[1fr_auto] items-center gap-x-6">
              <span className="font-medium">Ticketing System</span>
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground w-36 justify-start">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" aria-hidden="true" />
                Partial Outage
              </span>
            </div>

            <div className="rounded-lg border border-border bg-background/80 px-4 py-3 grid grid-cols-[1fr_auto] items-center gap-x-6">
              <span className="font-medium">Live Chat</span>
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground w-36 justify-start">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Operational
              </span>
            </div>

            <div className="rounded-lg border border-border bg-background/80 px-4 py-3 grid grid-cols-[1fr_auto] items-center gap-x-6">
              <span className="font-medium">Email Support</span>
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground w-36 justify-start">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
                Degraded Performance
              </span>
            </div>
          </div>
        </div>
      }
      textSection3b={
        <div className="flex flex-col h-full">
          <h3 className="text-2xl font-semibold mb-4">We're Here for You</h3>
          <p className="text-muted-foreground mb-4">
            Your success is our priority. That's why we've created comprehensive documentation 
            and support resources to ensure you get the most value from our platform.
          </p>
          <p className="text-muted-foreground mb-4">
            Whether you need technical assistance, want to learn about new features, or have 
            questions about your account, our team is ready to help. We pride ourselves on 
            delivering exceptional customer service with an average satisfaction rating of 4.8/5.
          </p>
          <p className="text-muted-foreground mb-6">
            Have feedback or suggestions? We'd love to hear from you. Your input helps us improve 
            our platform and create better experiences for all customers.
          </p>
          <div className="mt-auto text-left">
            <Link href="/en/contact" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
              Share Your Feedback →
            </Link>
          </div>
        </div>
      }
    />
  );
}
