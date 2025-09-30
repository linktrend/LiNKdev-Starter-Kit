import { useTranslations } from 'next-intl';

export default function TestI18nPage() {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          i18n Test Page
        </h1>
        
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Common Translations</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {t('loading')}</p>
              <p><strong>Error:</strong> {t('error')}</p>
              <p><strong>Success:</strong> {t('success')}</p>
              <p><strong>Save:</strong> {t('save')}</p>
              <p><strong>Cancel:</strong> {t('cancel')}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Navigation Translations</h2>
            <div className="space-y-2">
              <p><strong>Home:</strong> {t('navigation.home')}</p>
              <p><strong>Dashboard:</strong> {t('navigation.dashboard')}</p>
              <p><strong>Settings:</strong> {t('navigation.settings')}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Auth Translations</h2>
            <div className="space-y-2">
              <p><strong>Sign In:</strong> {t('auth.signIn')}</p>
              <p><strong>Sign Up:</strong> {t('auth.signUp')}</p>
              <p><strong>Email:</strong> {t('auth.email')}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">
            <strong>Test Instructions:</strong> Try accessing this page with different locales:
          </p>
          <ul className="mt-2 text-blue-700 dark:text-blue-300 list-disc list-inside">
            <li><code>/en/test-i18n</code> - English version</li>
            <li><code>/es/test-i18n</code> - Spanish version</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
