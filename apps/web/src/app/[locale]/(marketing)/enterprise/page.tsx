import { FeaturePageLayout } from '@/components/layouts/FeaturePageLayout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EnterprisePage() {
  return (
    <FeaturePageLayout
      title="Enterprise Solutions"
      subtitle="Powerful, scalable, and secure solutions designed for enterprise-scale operations"
      featureSection1b={
        <div className="bg-gradient-to-r from-slate-500/10 to-zinc-500/10 rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            {/* Placeholder for enterprise customer logos */}
            Trusted by leading enterprises worldwide
          </p>
        </div>
      }
      mainContent={
        <div className="space-y-16">
          {/* Enterprise Features */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">Enterprise-Grade Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Advanced Security</h3>
                <p className="text-muted-foreground">
                  SOC 2 Type II certified, GDPR compliant, with enterprise SSO, advanced encryption, and detailed audit logs.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Dedicated Infrastructure</h3>
                <p className="text-muted-foreground">
                  Private cloud deployment options with dedicated resources, custom configurations, and guaranteed SLAs.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Premium Support</h3>
                <p className="text-muted-foreground">
                  24/7 phone and chat support with 15-minute response times, dedicated account team, and proactive monitoring.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Custom Integrations</h3>
                <p className="text-muted-foreground">
                  Seamless integration with your existing enterprise systems, custom API development, and professional services.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Compliance & Governance</h3>
                <p className="text-muted-foreground">
                  Meet regulatory requirements with built-in compliance tools, data residency options, and governance controls.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade analytics with custom reporting, data export, and integration with BI tools.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Ready to Scale Your Enterprise?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Schedule a demo with our enterprise team to discuss your specific requirements and learn how we can help your organization succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/en/contact">Schedule a Demo</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/en/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex flex-col justify-center">
          <h3 className="text-2xl font-semibold mb-6">What's Included</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start">
              <span className="mr-3 text-primary">✓</span>
              <span>Unlimited users and projects</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-primary">✓</span>
              <span>Custom SLA agreements</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-primary">✓</span>
              <span>Dedicated success manager</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-primary">✓</span>
              <span>Priority feature requests</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-primary">✓</span>
              <span>On-site training available</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-primary">✓</span>
              <span>Custom contract terms</span>
            </li>
          </ul>
        </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">Trusted by Industry Leaders</h3>
          <p className="text-muted-foreground mb-4">
            Fortune 500 companies and fast-growing enterprises trust our platform to power their mission-critical applications. 
            With 99.99% uptime SLA and enterprise-grade security, we provide the reliability your business demands.
          </p>
          <p className="text-muted-foreground mb-6">
            Our enterprise customers benefit from dedicated support teams, custom onboarding programs, and strategic guidance 
            to ensure maximum ROI from day one. We're not just a vendor—we're your long-term technology partner.
          </p>
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">Contact Our Enterprise Team</h4>
            <p className="text-muted-foreground mb-4">
              Email: <a href="mailto:enterprise@example.com" className="text-primary hover:underline">enterprise@example.com</a>
            </p>
      <p className="text-muted-foreground">
              Phone: <a href="tel:+1-555-ENTERPRISE" className="text-primary hover:underline">+1 (555) ENTERPRISE</a>
      </p>
    </div>
        </div>
      }
    />
  );
}
