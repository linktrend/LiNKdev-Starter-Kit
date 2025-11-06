import { FeaturePageLayout } from '@/components/layouts/FeaturePageLayout';
import Link from 'next/link';
import { AppWindow, Server, Smartphone, BarChart } from 'lucide-react';

export default function AboutPage() {
  return (
    <FeaturePageLayout
      title="About Us"
      subtitle="Building the future of scalable, intelligent software platforms"
      featureSection1b={
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            {/* Placeholder for company timeline or milestone visualization */}
            Our journey from startup to industry leader
          </p>
        </div>
      }
      mainContent={
        <div className="space-y-16">
          {/* Introduction & What We Do */}
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold mb-6">Introduction to LiNKtrend Media</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Founded on the principle of innovation, LiNKtrend Media is a premier software development firm dedicated to crafting bespoke digital solutions. We partner with startups and enterprises to design, build, and scale cutting-edge applications that drive growth and define industries.
            </p>
            
            <h2 className="text-3xl font-bold mb-6">What We Do</h2>
            <p className="text-muted-foreground text-lg mb-8">
              We specialize in full-stack development, with a core focus on creating robust web and mobile applications, scalable cloud infrastructure, and intelligent systems powered by AI. From initial concept to final deployment, we provide end-to-end services that turn ambitious ideas into market-ready realities.
            </p>
          </div>

          {/* Portfolio */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">Our Portfolio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-background rounded-lg border text-center">
                <AppWindow className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Enterprise CRM</h3>
                <p className="text-muted-foreground">
                  A multi-tenant SaaS platform for managing customer relationships, sales pipelines, and analytics.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border text-center">
                <Server className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Cloud Migration</h3>
                <p className="text-muted-foreground">
                  End-to-end service for migrating legacy systems to a modern, scalable cloud infrastructure.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border text-center">
                <Smartphone className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Mobile Banking App</h3>
                <p className="text-muted-foreground">
                  A secure, cross-platform mobile application for a leading fintech startup, available on iOS and Android.
                </p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border text-center">
                <BarChart className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">AI Analytics Engine</h3>
                <p className="text-muted-foreground">
                  A powerful data processing engine that uses machine learning to provide actionable business insights.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 bg-muted/30 rounded-lg px-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Completed Projects</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2M+</div>
              <div className="text-muted-foreground">Users Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      }
      featureSection3a={
        <div className="h-full w-full">
          <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
            <div className="col-span-1 row-span-1 rounded-lg overflow-hidden">
              <img src="https://picsum.photos/seed/office1/600/400" alt="Office Image 1" className="w-full h-full object-cover" />
            </div>
            <div className="col-span-1 row-span-2 rounded-lg overflow-hidden">
              <img src="https://picsum.photos/seed/tech2/600/800" alt="App Logo 1" className="w-full h-full object-cover" />
            </div>
            <div className="col-span-1 row-span-1 rounded-lg overflow-hidden">
              <img src="https://picsum.photos/seed/people3/600/400" alt="Team Image 1" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      }
      textSection3b={
        <div className="flex flex-col h-full">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Let's Build Together</h3>
            <p className="text-muted-foreground mb-4">
              LiNKtrend Media is constantly developing new public and private applications and pushing the boundaries in the AI space. We partner with innovative companies to bring their visions to life.
            </p>
            <p className="text-muted-foreground mb-6">
              If you are interested in hiring us for your next project, we'd love to hear from you. We are also always looking for passionate talent to join our team. Explore our work and get in touch.
            </p>
          </div>
          <div className="mt-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/en/contact" className="text-primary hover:underline font-medium">
                Contact Us →
              </Link>
              <Link href="/en/contact" className="text-primary hover:underline font-medium">
                View Open Roles →
              </Link>
            </div>
          </div>
        </div>
      }
    />
  );
}
