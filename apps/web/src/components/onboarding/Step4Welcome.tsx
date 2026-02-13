'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, Video, MessageCircle, FileText, Users, Gift, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingData } from '@/hooks/useOnboarding';
import { useLocalePath } from '@/hooks/useLocalePath';

interface Step4Props {
  data: OnboardingData;
  onBack: () => void;
}

export function Step4Welcome({ data, onBack }: Step4Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const { buildPath } = useLocalePath();
  
  // Generate referral link (mock)
  const referralLink = `https://app.example.com/signup?ref=${data.username || 'user'}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGetStarted = () => {
    // TODO: Save all onboarding data to backend
    console.log('Onboarding complete:', data);
    router.push(buildPath('/dashboard'));
  };

  const resources = [
    {
      icon: BookOpen,
      title: 'Getting Started Guide',
      description: 'Learn the basics in 5 minutes',
      link: 'https://github.com/linktrend/LiNKdev-Starter-Kit/tree/main/docs',
      external: true,
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step walkthroughs',
      link: 'https://help.company.com/tutorials',
      external: true,
    },
    {
      icon: FileText,
      title: 'Documentation',
      description: 'Comprehensive guides and references',
      link: 'https://github.com/linktrend/LiNKdev-Starter-Kit/tree/main/docs',
      external: true,
    },
    {
      icon: MessageCircle,
      title: 'Community Forum',
      description: 'Connect with other users',
      link: 'https://community.example.com',
      external: true,
    },
    {
      icon: Users,
      title: 'Support Center',
      description: 'Get help from our team',
      link: '/dashboard/help',
    },
  ];

  const offers = [
    {
      icon: Gift,
      title: 'Refer a Friend',
      description: 'Share your referral link and earn rewards when friends sign up',
      action: 'copy-link',
      badge: 'Earn $10',
    },
    {
      icon: Sparkles,
      title: 'Premium Trial',
      description: 'Get 20% off your first month of Premium',
      action: 'claim-discount',
      badge: '20% OFF',
    },
    {
      icon: Users,
      title: 'Free Onboarding Call',
      description: 'Schedule a 1-on-1 session with our team',
      action: 'schedule-call',
      badge: 'Limited',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">
          You&apos;re all set!
        </h2>
        <p className="text-muted-foreground">
          Here are some resources and offers or get started.
        </p>
      </div>

      {/* Quick Links Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quick Links
          </CardTitle>
          <CardDescription>
            Everything you need to get up and running
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource) => {
              const Icon = resource.icon;
              return (
                <a
                  key={resource.title}
                  href={resource.external ? resource.link : buildPath(resource.link)}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-background hover:bg-accent transition-all group"
                  target={resource.external ? '_blank' : undefined}
                  rel={resource.external ? 'noreferrer' : undefined}
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{resource.title}</h4>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-all" />
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Special Offers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Special Offers
          </CardTitle>
          <CardDescription>
            Exclusive benefits for new members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {offers.map((offer) => {
              const Icon = offer.icon;
              return (
                <div
                  key={offer.title}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-transparent"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{offer.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                        {offer.badge}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{offer.description}</p>
                    
                    {offer.action === 'copy-link' && (
                      <div className="flex gap-2">
                        <Input
                          value={referralLink}
                          readOnly
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyReferral}
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {offer.action === 'claim-discount' && (
                      <Button size="sm" variant="outline">
                        Claim Discount
                      </Button>
                    )}
                    
                    {offer.action === 'schedule-call' && (
                      <Button size="sm" variant="outline">
                        Schedule Now
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button size="lg" onClick={handleGetStarted}>
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
