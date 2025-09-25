import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@starter/ui';
import { Button } from '@starter/ui';
import { Input } from '@starter/ui';
import { Badge } from '@starter/ui';
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  Phone,
  ChevronRight,
  FileText,
  Video,
  Download,
  ExternalLink
} from 'lucide-react';

export const metadata = {
  title: 'Help Center',
  description: 'Get help and support for using LTM Starter Kit',
};

export default function HelpPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Help Center</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers, get support, and learn how to make the most of LTM Starter Kit
        </p>
        
        {/* Search */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              className="pl-10 pr-4 py-2"
            />
          </div>
        </div>
      </div>

      {/* Quick Help Categories */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <p className="text-sm text-muted-foreground">
              Learn the basics and set up your account
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">User Guide</h3>
            <p className="text-sm text-muted-foreground">
              Detailed guides for all features
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Video Tutorials</h3>
            <p className="text-sm text-muted-foreground">
              Watch step-by-step video guides
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Contact Support</h3>
            <p className="text-sm text-muted-foreground">
              Get help from our support team
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Articles */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Popular Articles</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">How to create your first record</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn how to create and manage records in LTM Starter Kit
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Getting Started</Badge>
                    <span className="text-xs text-muted-foreground">5 min read</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Setting up organization teams</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Invite team members and manage permissions
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Teams</Badge>
                    <span className="text-xs text-muted-foreground">8 min read</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Video className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Understanding billing and plans</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Everything you need to know about pricing
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Billing</Badge>
                    <span className="text-xs text-muted-foreground">6 min read</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Troubleshooting common issues</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Solutions to frequently encountered problems
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Troubleshooting</Badge>
                    <span className="text-xs text-muted-foreground">10 min read</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">How do I get started with LTM Starter Kit?</h3>
              <p className="text-sm text-muted-foreground">
                Getting started is easy! Simply sign up for an account, create your first organization, 
                and start adding records. Check out our getting started guide for detailed instructions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Can I invite team members to my organization?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can invite team members by going to your organization settings and clicking 
                "Invite Member". You can set different permission levels for each team member.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">What happens to my data if I cancel my subscription?</h3>
              <p className="text-sm text-muted-foreground">
                Your data is always yours. If you cancel your subscription, you can export all your 
                data before the cancellation takes effect. We also offer a grace period for data access.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Is there an API available?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! We provide a comprehensive REST API that allows you to integrate LTM Starter Kit with 
                your existing tools and workflows. API documentation is available in your account settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Support */}
      <Card className="bg-muted/50">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you get the most out of LTM Starter Kit.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button>
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat Support
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Email Support
            </Button>
            <Button variant="outline">
              <Phone className="mr-2 h-4 w-4" />
              Phone Support
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              TODO: Implement real support contact forms and integration with support system
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Additional Resources</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Download className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Download Center</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Download apps, templates, and other resources
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Downloads
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">API Documentation</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Complete API reference and integration guides
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Docs
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Community Forum</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with other users and share tips
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Join Community
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
