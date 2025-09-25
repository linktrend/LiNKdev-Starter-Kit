export default function SimpleHomepage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          LTM Starter Kit
        </h1>
        <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-12">
          A complete & open-source Next.js 14 SaaS template using Supabase, Stripe, Tailwind CSS.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Next.js 14</h3>
            <p className="text-gray-600 dark:text-gray-300">App router, Server Components, and more.</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Supabase</h3>
            <p className="text-gray-600 dark:text-gray-300">Typesafe queries, user authentication, and the full power of PostgreSQL.</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Tailwind CSS</h3>
            <p className="text-gray-600 dark:text-gray-300">UI components built using Radix UI and styled with Tailwind CSS.</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Starter</h3>
              <p className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">$9</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Kickstart your journey with essential templates and community access.</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Access to basic template library</li>
                <li>• Monthly community newsletter</li>
                <li>• Entry to our Template Exchange forum</li>
              </ul>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pro</h3>
              <p className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">$99</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">For those who need advanced templates and enhanced community engagement.</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Access to premium template library</li>
                <li>• Weekly community digest</li>
                <li>• Priority access to Template Exchange forum</li>
              </ul>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Enterprise</h3>
              <p className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">$999</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">For organizations that require comprehensive templates and dedicated support.</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
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
