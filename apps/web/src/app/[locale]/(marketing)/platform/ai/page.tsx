import { PlatformPageLayout } from '@/components/layouts/PlatformPageLayout';

export default function AIPage() {
  return (
    <PlatformPageLayout
      title="AI-Powered Intelligence"
      subtitle="Harness the power of artificial intelligence to transform your business"
      featureSection1b={
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            {/* Placeholder for AI capabilities showcase */}
            Interactive AI capabilities demo coming soon
          </p>
        </div>
      }
      mainContent={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Natural Language Processing</h3>
            <p className="text-muted-foreground">
              Understand and process human language with advanced NLP capabilities. Build 
              chatbots, sentiment analysis tools, and more.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Predictive Analytics</h3>
            <p className="text-muted-foreground">
              Leverage machine learning models to predict trends, user behavior, and business 
              outcomes with high accuracy.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Smart Automation</h3>
            <p className="text-muted-foreground">
              Automate repetitive tasks and workflows with AI-driven decision making. 
              Free your team to focus on strategic initiatives.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Computer Vision</h3>
            <p className="text-muted-foreground">
              Analyze and understand visual content with state-of-the-art image and video 
              recognition capabilities.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Personalization Engine</h3>
            <p className="text-muted-foreground">
              Deliver personalized experiences to each user based on their behavior, 
              preferences, and interactions.
            </p>
          </div>
          
          <div className="p-6 bg-background rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Anomaly Detection</h3>
            <p className="text-muted-foreground">
              Identify unusual patterns and potential issues before they become problems. 
              Proactive monitoring powered by AI.
            </p>
          </div>
        </div>
      }
      featureSection3a={
        <div className="bg-muted/50 rounded-lg p-8 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            {/* Placeholder for AI model showcase or use cases */}
            AI model performance visualization
          </p>
        </div>
      }
      textSection3b={
        <div>
          <h3 className="text-2xl font-semibold mb-4">The Future is Intelligent</h3>
          <p className="text-muted-foreground mb-4">
            Artificial intelligence is no longer a luxury—it's a necessity for businesses 
            that want to stay competitive. Our AI platform makes it easy to integrate 
            advanced intelligence into your applications.
          </p>
          <p className="text-muted-foreground mb-4">
            From startups to Fortune 500 companies, organizations are using our AI tools 
            to gain insights, automate processes, and deliver exceptional user experiences.
          </p>
      <p className="text-muted-foreground">
            Start building intelligent applications today without needing a PhD in machine learning.
      </p>
    </div>
      }
    />
  );
}

