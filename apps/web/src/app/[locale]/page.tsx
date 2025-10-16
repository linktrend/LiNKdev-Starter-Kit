export default function HomePage() {
  return (
    <div className="min-h-screen liquid-glass-bg-light">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
          LTM Starter Kit
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-12">
          A complete & open-source Next.js 14 SaaS template using Supabase, Stripe, Tailwind CSS.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-card-foreground">Next.js 14</h3>
            <p className="text-muted-foreground">App router, Server Components, and more.</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-card-foreground">Supabase</h3>
            <p className="text-muted-foreground">Typesafe queries, user authentication, and the full power of PostgreSQL.</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-card-foreground">Tailwind CSS</h3>
            <p className="text-muted-foreground">UI components built using Radix UI and styled with Tailwind CSS.</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-card-foreground">Starter</h3>
              <p className="text-3xl font-bold mb-4 text-card-foreground">$9</p>
              <p className="text-muted-foreground mb-4">Kickstart your journey with essential templates and community access.</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Access to basic template library</li>
                <li>• Monthly community newsletter</li>
                <li>• Entry to our Template Exchange forum</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-card-foreground">Pro</h3>
              <p className="text-3xl font-bold mb-4 text-card-foreground">$99</p>
              <p className="text-muted-foreground mb-4">For those who need advanced templates and enhanced community engagement.</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Access to premium template library</li>
                <li>• Weekly community digest</li>
                <li>• Priority access to Template Exchange forum</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-card-foreground">Enterprise</h3>
              <p className="text-3xl font-bold mb-4 text-card-foreground">$999</p>
              <p className="text-muted-foreground mb-4">For organizations that require comprehensive templates and dedicated support.</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Unlimited access to all templates</li>
                <li>• Daily template updates</li>
                <li>• VIP access to Template Exchange forum</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
