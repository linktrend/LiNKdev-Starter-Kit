'use client';

import { FeaturePageLayout } from '@/components/layouts/FeaturePageLayout';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Send, Calendar, Clock, FileText, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  // Ticket Form State
  const [ticketData, setTicketData] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    description: '',
  });

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'ai' as const,
      timestamp: new Date(),
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Schedule Call State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [contactFormData, setContactFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Ticket submitted:', ticketData);
    setIsTicketFormOpen(false);
    setTicketData({ subject: '', category: 'technical', priority: 'medium', description: '' });
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user' as const,
      timestamp: new Date(),
    };
    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Call scheduled:', { selectedDate, selectedTime });
    setIsScheduleOpen(false);
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactFormData);
    setIsContactFormOpen(false);
    setContactFormData({
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      subject: '',
      message: '',
    });
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];

  return (
    <>
      {isContactFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg border shadow-2xl bg-background">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Contact Our Team</h2>
              </div>
              <button
                onClick={() => setIsContactFormOpen(false)}
                className="p-1 hover:bg-muted rounded-lg transition-all"
                aria-label="Close contact form"
              >
                <X className="h-5 w-5 text-muted-foreground/70" />
              </button>
            </div>
            <form onSubmit={handleContactFormSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={contactFormData.firstName}
                    onChange={(e) => setContactFormData({ ...contactFormData, firstName: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={contactFormData.lastName}
                    onChange={(e) => setContactFormData({ ...contactFormData, lastName: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <input
                    type="text"
                    value={contactFormData.company}
                    onChange={(e) => setContactFormData({ ...contactFormData, company: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Your Company"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject <span className="text-red-500">*</span></label>
                <select
                  value={contactFormData.subject}
                  onChange={(e) => setContactFormData({ ...contactFormData, subject: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a subject</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="billing">Billing Question</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message <span className="text-red-500">*</span></label>
                <textarea
                  value={contactFormData.message}
                  onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsContactFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="!bg-[hsl(var(--accent-red))] !text-[hsl(var(--accent-red-foreground))] !hover:bg-[hsl(var(--accent-red))]/90">
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <FeaturePageLayout
      title="Contact Us"
      subtitle="Get in touch with our team—we're here to help you succeed"
      featureSection1b={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-background rounded-lg border text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Us</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Send us an email and we'll respond within 24 hours.
            </p>
            <a href="mailto:hello@example.com" className="text-primary hover:underline text-sm">
              hello@example.com
            </a>
          </div>

          <div className="p-6 bg-background rounded-lg border text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fill Out a Form</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Prefer email? Send us your details and we'll follow up shortly.
            </p>
            <button
              onClick={() => setIsContactFormOpen(true)}
              className="text-primary hover:underline text-sm"
            >
              Open Form →
            </button>
          </div>

          <div className="p-6 bg-background rounded-lg border text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Chat with our support team in real-time.
            </p>
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="text-primary hover:underline text-sm"
            >
              {isChatOpen ? 'Close Chat' : 'Start Chat →'}
            </button>
          </div>
        </div>
      }
      mainContent={
        <div className="space-y-12">
          {/* Submit Support Ticket Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Submit a Support Ticket</h2>
              <p className="text-muted-foreground">
                Need technical support? Submit a ticket and our team will get back to you.
              </p>
            </div>

            {!isTicketFormOpen ? (
              <div className="p-8 bg-muted/30 rounded-lg border text-center">
                <Send className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Open a Support Ticket</h3>
                <p className="text-muted-foreground mb-4">
                  Get help from our technical support team. We typically respond within 4-6 hours.
                </p>
                <Button onClick={() => setIsTicketFormOpen(true)} className="!bg-[hsl(var(--accent-red))] !text-[hsl(var(--accent-red-foreground))] !hover:bg-[hsl(var(--accent-red))]/90">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Ticket
                </Button>
              </div>
            ) : (
              <div className="p-8 bg-background rounded-lg border">
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ticketData.subject}
                      onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={ticketData.category}
                        onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="account">Account & Settings</option>
                        <option value="feature">Feature Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Priority <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={ticketData.priority}
                        onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={ticketData.description}
                      onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                      required
                      rows={6}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="Please provide detailed information about your issue..."
                    />
                  </div>

                  <div className="flex gap-4 justify-end pt-4">
                    <Button
                      type="button"
                      onClick={() => setIsTicketFormOpen(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="!bg-[hsl(var(--accent-red))] !text-[hsl(var(--accent-red-foreground))] !hover:bg-[hsl(var(--accent-red))]/90">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Ticket
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Live Chat Support Section */}
          {isChatOpen && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Live Chat Support</h2>
                <p className="text-muted-foreground">
                  Chat with our AI assistant or connect with a human agent.
                </p>
              </div>

              <div className="border border-border rounded-lg bg-background overflow-hidden">
                <div className="p-4 border-b bg-muted/20">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Support Chat</h3>
                  </div>
                </div>

                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user' ? 'bg-primary' : 'bg-muted'
                      }`}>
                        {message.sender === 'user' ? '👤' : '🤖'}
                      </div>
                      <div className={`flex flex-col max-w-[70%]`}>
                        <div className={`px-4 py-2 rounded-lg ${
                          message.sender === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <span className="text-xs text-muted-foreground/50 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Button onClick={handleChatSend} className="!bg-[hsl(var(--accent-red))] !text-[hsl(var(--accent-red-foreground))] !hover:bg-[hsl(var(--accent-red))]/90">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule a Call Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Schedule a Call</h2>
      <p className="text-muted-foreground">
                Book a time to speak directly with our support team.
              </p>
            </div>

            {!isScheduleOpen ? (
              <div className="p-8 bg-muted/30 rounded-lg border text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Book a Support Call</h3>
                <p className="text-muted-foreground mb-4">
                  Schedule a call with our team to discuss your needs. Available Monday-Friday, 9am-5pm EST.
                </p>
                <Button onClick={() => setIsScheduleOpen(true)} className="!bg-[hsl(var(--accent-red))] !text-[hsl(var(--accent-red-foreground))] !hover:bg-[hsl(var(--accent-red))]/90">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Call
                </Button>
              </div>
            ) : (
              <div className="p-8 bg-background rounded-lg border">
                <form onSubmit={handleScheduleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Select Time <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                              selectedTime === time
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-input hover:border-primary'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDate && selectedTime && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-900">
                        <Clock className="inline h-4 w-4 mr-1" />
                        {selectedDate.toLocaleDateString()} at {selectedTime} EST
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4 justify-end pt-4">
                    <Button
                      type="button"
                      onClick={() => setIsScheduleOpen(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!selectedDate || !selectedTime}
                      className="!bg-[hsl(var(--accent-red))] !text-[hsl(var(--accent-red-foreground))] !hover:bg-[hsl(var(--accent-red))]/90"
                    >
                      Confirm Call
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>
      }
      featureSection3a={
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-8 h-full flex flex-col gap-4 justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-border bg-background/80 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-red-500" aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">Support Tickets</span>
              </div>
              <span className="text-xs text-muted-foreground">Issue Detected</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-background/80 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-yellow-400" aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">Call Volume</span>
              </div>
              <span className="text-xs text-muted-foreground">High Load</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-background/80 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">Live Chat</span>
              </div>
              <span className="text-xs text-muted-foreground">Operating Normally</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-background/80 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">Email Response</span>
              </div>
              <span className="text-xs text-muted-foreground">On Track</span>
            </div>
          </div>
          <div className="text-center mt-auto">
            <p className="text-muted-foreground mb-1">
              Average response time: 2 hours
            </p>
            <p className="text-sm text-muted-foreground">
              Customer satisfaction: 4.8/5
            </p>
          </div>
        </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">We're Here to Help</h3>
          <p className="text-muted-foreground mb-4">
            Whether you're a prospective customer, current user, or just curious about what we do, we'd love to 
            hear from you. Our team is dedicated to providing excellent support and answering all your questions.
          </p>
          <p className="text-muted-foreground mb-4">
            For urgent technical support issues, existing customers can access our priority support channels 
            through the customer portal. We aim to respond to all inquiries within one business day.
          </p>
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">Looking for something specific?</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/en/resources/library" className="text-primary hover:underline">
                  FAQ & Resources →
                </Link>
              </li>
              <li>
                <Link href="/en/resources/for-customers" className="text-primary hover:underline">
                  User Documentation →
                </Link>
              </li>
              <li>
                <Link href="/en/enterprise" className="text-primary hover:underline">
                  Enterprise
                </Link>
              </li>
            </ul>
          </div>
        </div>
      }
    />
    </>
  );
}
