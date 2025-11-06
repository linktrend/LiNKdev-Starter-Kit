import { PlatformPageLayout } from '@/components/layouts/PlatformPageLayout';

export default function InnovationSupportPage() {
  return (
    <PlatformPageLayout
      title="Innovation & Support"
      subtitle="Continuous innovation backed by world-class support, always there when you need us"
      featureSection1b={
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            {/* Placeholder for support statistics or innovation timeline */}
            Support metrics and innovation timeline coming soon
          </p>
        </div>
      }
      mainContent={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">24/7 Expert Support</h3>
            <p className="text-muted-foreground">
              Our dedicated support team is available around the clock to help you resolve 
              issues quickly and keep your business running smoothly.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Regular Updates</h3>
            <p className="text-muted-foreground">
              Benefit from continuous platform improvements, new features, and security 
              updates delivered seamlessly without disruption.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Dedicated Success Manager</h3>
            <p className="text-muted-foreground">
              Enterprise customers get a dedicated success manager who understands your 
              business and helps you maximize platform value.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Priority Response</h3>
            <p className="text-muted-foreground">
              Critical issues are escalated immediately to our senior engineering team. 
              Average response time under 15 minutes for urgent matters.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Community & Resources</h3>
            <p className="text-muted-foreground">
              Access extensive documentation, tutorials, and a vibrant community of developers 
              and users sharing best practices.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Feature Requests</h3>
            <p className="text-muted-foreground">
              Your feedback shapes our roadmap. Submit feature requests and vote on what 
              matters most to your business.
            </p>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            {/* Placeholder for support channels or customer testimonials */}
            Support channels and testimonials carousel
          </p>
        </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">Always Moving Forward</h3>
          <p className="text-muted-foreground mb-4">
            We believe that great technology is never finished. That's why we invest heavily 
            in R&D and continuously improve our platform based on customer feedback and 
            emerging technologies.
          </p>
          <p className="text-muted-foreground mb-4">
            Our support team doesn't just fix issues—they're partners in your success. 
            With an average customer satisfaction score of 4.8/5, we're committed to 
            providing exceptional service.
          </p>
      <p className="text-muted-foreground">
            Experience the difference that truly dedicated support and continuous innovation can make.
      </p>
    </div>
      }
    />
  );
}

