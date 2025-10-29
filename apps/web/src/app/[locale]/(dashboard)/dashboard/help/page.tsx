'use client';

import { useState } from 'react';
import { HelpCircle, FileText, Video, Book, Send, MessageCircle, Phone, Clock, Lightbulb, Bug, Star, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubmitTicketModal from '@/components/help/SubmitTicketModal';
import LiveChatModal from '@/components/help/LiveChatModal';
import ScheduleCallModal from '@/components/help/ScheduleCallModal';
import FeatureRequestModal from '@/components/help/FeatureRequestModal';
import ReportBugModal from '@/components/help/ReportBugModal';
import UserSurveyModal from '@/components/help/UserSurveyModal';
import ReleaseNotesModal from '@/components/help/ReleaseNotesModal';
import UserDocumentationModal from '@/components/help/UserDocumentationModal';
import FAQModal from '@/components/help/FAQModal';

export default function HelpPage() {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isLiveChatModalOpen, setIsLiveChatModalOpen] = useState(false);
  const [isScheduleCallModalOpen, setIsScheduleCallModalOpen] = useState(false);
  const [isFeatureRequestModalOpen, setIsFeatureRequestModalOpen] = useState(false);
  const [isReportBugModalOpen, setIsReportBugModalOpen] = useState(false);
  const [isUserSurveyModalOpen, setIsUserSurveyModalOpen] = useState(false);
  const [isReleaseNotesModalOpen, setIsReleaseNotesModalOpen] = useState(false);
  const [isUserDocumentationModalOpen, setIsUserDocumentationModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);

  return (
    <>
      <SubmitTicketModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} />
      <LiveChatModal isOpen={isLiveChatModalOpen} onClose={() => setIsLiveChatModalOpen(false)} />
      <ScheduleCallModal isOpen={isScheduleCallModalOpen} onClose={() => setIsScheduleCallModalOpen(false)} />
      <FeatureRequestModal isOpen={isFeatureRequestModalOpen} onClose={() => setIsFeatureRequestModalOpen(false)} />
      <ReportBugModal isOpen={isReportBugModalOpen} onClose={() => setIsReportBugModalOpen(false)} />
      <UserSurveyModal isOpen={isUserSurveyModalOpen} onClose={() => setIsUserSurveyModalOpen(false)} />
      <ReleaseNotesModal isOpen={isReleaseNotesModalOpen} onClose={() => setIsReleaseNotesModalOpen(false)} />
      <UserDocumentationModal isOpen={isUserDocumentationModalOpen} onClose={() => setIsUserDocumentationModalOpen(false)} />
      <FAQModal 
        isOpen={isFAQModalOpen} 
        onClose={() => setIsFAQModalOpen(false)}
        onOpenUserDocs={() => setIsUserDocumentationModalOpen(true)}
        onOpenVideoTutorials={() => window.open('https://help.company.com/tutorials', '_blank')}
        onOpenSupportTicket={() => setIsTicketModalOpen(true)}
        onOpenLiveChat={() => setIsLiveChatModalOpen(true)}
        onOpenScheduleCall={() => setIsScheduleCallModalOpen(true)}
      />
    
    <div>
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          <div 
            className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-card-foreground">Help Center</h2>
            </div>
            <p className="text-sm text-card-foreground/70 mb-6">
              Find answers to common questions and access tutorials
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setIsFAQModalOpen(true)}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Frequently Asked Questions
              </Button>
              <Button 
                onClick={() => window.open('https://help.company.com/tutorials', '_blank')}
                className="w-full"
              >
                <Video className="h-4 w-4 mr-2" />
                Video Tutorials
              </Button>
              <Button 
                onClick={() => setIsUserDocumentationModalOpen(true)}
                className="w-full"
              >
                <Book className="h-4 w-4 mr-2" />
                User Documentation
              </Button>
            </div>
          </div>

          <div 
            className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-card-foreground">Contact Support</h2>
            </div>
            <p className="text-sm text-card-foreground/70 mb-6">
              Get help from our support team. Mon-Fri 9AM-6PM EST
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setIsTicketModalOpen(true)}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Support Ticket
              </Button>
              <Button 
                onClick={() => setIsLiveChatModalOpen(true)}
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat Support
              </Button>
              <Button 
                onClick={() => setIsScheduleCallModalOpen(true)}
                className="w-full"
              >
                <Phone className="h-4 w-4 mr-2" />
                Schedule a Call
              </Button>
            </div>
          </div>

          <div 
            className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-card-foreground">Send Feedback</h2>
            </div>
            <p className="text-sm text-card-foreground/70 mb-6">
              Help us improve by sharing your thoughts
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setIsFeatureRequestModalOpen(true)}
                className="w-full"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Feature Request
              </Button>
              <Button 
                onClick={() => setIsReportBugModalOpen(true)}
                className="w-full"
              >
                <Bug className="h-4 w-4 mr-2" />
                Report a Bug
              </Button>
              <Button 
                onClick={() => setIsUserSurveyModalOpen(true)}
                className="w-full"
              >
                <Star className="h-4 w-4 mr-2" />
                Take User Survey
              </Button>
            </div>
          </div>

          <div 
            className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-card-foreground">Release Notes</h2>
            </div>
            <p className="text-sm text-card-foreground/70 mb-6">
              Latest features and improvements
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setIsReleaseNotesModalOpen(true)}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Latest Updates
              </Button>
            </div>
            <div className="mt-auto pt-6">
              <div 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 rounded-lg bg-success/10 border border-success/30 w-full"
              >
                <CheckCircle className="h-4 w-4 text-success mr-2" />
                <span className="text-sm text-success font-medium">Latest Version: 2.1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

