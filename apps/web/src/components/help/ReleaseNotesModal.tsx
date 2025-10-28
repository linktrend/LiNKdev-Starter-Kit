'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, CheckCircle, Sparkles, Bug, Zap } from 'lucide-react';

interface Release {
  version: string;
  date: string;
  features: string[];
  improvements: string[];
  bugFixes: string[];
}

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReleaseNotesModal({ isOpen, onClose }: ReleaseNotesModalProps) {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  const toggleVersion = (version: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  };

  const releases: Release[] = [
    {
      version: '2.1.0',
      date: '01/12/2024',
      features: [
        'New liquid glass design system with enhanced glassmorphism effects',
        'Multi-step onboarding experience with progress tracking',
        'Dual navigation sidebars for app and console modes',
        'Enhanced notifications with expand functionality',
      ],
      improvements: [
        'Improved page load performance by 40%',
        'Better mobile responsiveness across all pages',
        'Enhanced accessibility with ARIA labels',
        'Updated color system with HSL-based variables',
      ],
      bugFixes: [
        'Fixed sidebar navigation highlighting on active routes',
        'Resolved modal scroll issues on mobile devices',
        'Corrected timezone display in notification timestamps',
      ],
    },
    {
      version: '2.0.5',
      date: '15/11/2024',
      features: [
        'Added dark mode support',
        'Introduced keyboard shortcuts for common actions',
      ],
      improvements: [
        'Enhanced search functionality',
        'Improved form validation messages',
      ],
      bugFixes: [
        'Fixed profile image upload on Safari',
        'Resolved date picker issues in Firefox',
      ],
    },
    {
      version: '2.0.0',
      date: '01/11/2024',
      features: [
        'Complete UI redesign with modern aesthetics',
        'New dashboard with customizable widgets',
        'Advanced filtering and sorting options',
      ],
      improvements: [
        'Completely rewritten codebase with TypeScript',
        'Better error handling and user feedback',
      ],
      bugFixes: [
        'Fixed numerous UI inconsistencies',
        'Resolved data synchronization issues',
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div 
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg border shadow-2xl modal-bg"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-base text-muted-foreground">Release Notes</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-all"
          >
            <X className="h-5 w-5 text-muted-foreground/70" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {releases.map((release) => {
            const isExpanded = expandedVersions.has(release.version);
            const isLatest = release.version === releases[0].version;

            return (
              <div
                key={release.version}
                className="rounded-lg border border-border bg-background overflow-hidden"
              >
                <button
                  onClick={() => toggleVersion(release.version)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Version {release.version}
                        </span>
                        {isLatest && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-success/20 text-success rounded-full">
                            LATEST
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground/60">{release.date}</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground/70" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground/70" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                    {release.features.length > 0 && (
                      <div className="pt-4">
                        <h4 className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-500" />
                          New Features
                        </h4>
                        <ul className="space-y-2">
                          {release.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground/80 flex gap-2">
                              <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {release.improvements.length > 0 && (
                      <div>
                        <h4 className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-warning" />
                          Improvements
                        </h4>
                        <ul className="space-y-2">
                          {release.improvements.map((improvement, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground/80 flex gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {release.bugFixes.length > 0 && (
                      <div>
                        <h4 className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                          <Bug className="h-4 w-4 text-danger" />
                          Bug Fixes
                        </h4>
                        <ul className="space-y-2">
                          {release.bugFixes.map((fix, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground/80 flex gap-2">
                              <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                              <span>{fix}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border bg-muted">
          <p className="text-sm text-center text-muted-foreground/70">
            Want to see older versions? <button className="text-primary font-medium hover:underline">View full changelog</button>
          </p>
        </div>
      </div>
    </div>
  );
}
