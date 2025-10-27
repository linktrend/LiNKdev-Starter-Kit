'use client';

import { useState } from 'react';
import { HelpCircle, FileText, Video, Book, Send, MessageCircle, Phone, Star, Lightbulb, Bug, Eye, CheckCircle } from 'lucide-react';
import SubmitTicketModal from '@/components/help/SubmitTicketModal';
import LiveChatModal from '@/components/help/LiveChatModal';
import ScheduleCallModal from '@/components/help/ScheduleCallModal';
import FeatureRequestModal from '@/components/help/FeatureRequestModal';
import ReportBugModal from '@/components/help/ReportBugModal';
import UserSurveyModal from '@/components/help/UserSurveyModal';
import ReleaseNotesModal from '@/components/help/ReleaseNotesModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HelpPage() {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isLiveChatModalOpen, setIsLiveChatModalOpen] = useState(false);
  const [isScheduleCallModalOpen, setIsScheduleCallModalOpen] = useState(false);
  const [isFeatureRequestModalOpen, setIsFeatureRequestModalOpen] = useState(false);
  const [isReportBugModalOpen, setIsReportBugModalOpen] = useState(false);
  const [isUserSurveyModalOpen, setIsUserSurveyModalOpen] = useState(false);
  const [isReleaseNotesModalOpen, setIsReleaseNotesModalOpen] = useState(false);

  return (
    <>
      <SubmitTicketModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} />
      <LiveChatModal isOpen={isLiveChatModalOpen} onClose={() => setIsLiveChatModalOpen(false)} />
      <ScheduleCallModal isOpen={isScheduleCallModalOpen} onClose={() => setIsScheduleCallModalOpen(false)} />
      <FeatureRequestModal isOpen={isFeatureRequestModalOpen} onClose={() => setIsFeatureRequestModalOpen(false)} />
      <ReportBugModal isOpen={isReportBugModalOpen} onClose={() => setIsReportBugModalOpen(false)} />
      <UserSurveyModal isOpen={isUserSurveyModalOpen} onClose={() => setIsUserSurveyModalOpen(false)} />
      <ReleaseNotesModal isOpen={isReleaseNotesModalOpen} onClose={() => setIsReleaseNotesModalOpen(false)} />
    
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-6 w-6" />
                  Help Center
                </CardTitle>
                <CardDescription>
                  Find answers to common questions and access tutorials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => window.open('https://help.company.com/faq', '_blank')}
                  className="w-full"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Frequently Asked Questions
                </Button>
                <Button 
                  onClick={() => window.open('https://help.company.com/tutorials', '_blank')}
                  className="w-full"
                  variant="outline"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video Tutorials
                </Button>
                <Button 
                  onClick={() => window.open('https://help.company.com/docs', '_blank')}
                  className="w-full"
                  variant="outline"
                >
                  <Book className="h-4 w-4 mr-2" />
                  User Documentation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Get help from our support team. Mon-Fri 9AM-6PM EST
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setIsTicketModalOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Support Ticket
                </Button>
                <Button 
                  onClick={() => setIsLiveChatModalOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Live Chat Support
                </Button>
                <Button 
                  onClick={() => setIsScheduleCallModalOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Schedule a Call
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6" />
                  Send Feedback
                </CardTitle>
                <CardDescription>
                  Help us improve by sharing your thoughts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setIsFeatureRequestModalOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Feature Request
                </Button>
                <Button 
                  onClick={() => setIsReportBugModalOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Report a Bug
                </Button>
                <Button 
                  onClick={() => setIsUserSurveyModalOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Take User Survey
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Release Notes
                </CardTitle>
                <CardDescription>
                  Stay updated with the latest features and improvements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setIsReleaseNotesModalOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Latest Updates
                </Button>
                <div className="px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Latest Version: 2.1.0 (01/12/2024)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
