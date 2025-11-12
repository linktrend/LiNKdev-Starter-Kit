import { OnboardingData } from '@/hooks/useOnboarding';

// Mock data for onboarding
export const mockOnboardingData: Partial<OnboardingData> = {
  authMethod: 'email',
  email: 'user@example.com',
  acceptedTerms: true,
  username: 'johndoe',
  displayName: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  personalCountry: 'United States',
  language: 'en',
  timezone: 'America/New_York',
  theme: 'system',
};

// Available locales for preferences
export const LOCALE_OPTIONS = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'pt', label: 'Português', flag: '🇵🇹' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
];

// Notification preference options
export const NOTIFICATION_OPTIONS = [
  {
    id: 'email',
    label: 'Email Notifications',
    description: 'Receive updates via email',
    categories: [
      { id: 'productUpdates', label: 'Product Updates', default: true },
      { id: 'securityAlerts', label: 'Security Alerts', default: true },
      { id: 'marketing', label: 'Marketing Emails', default: false },
      { id: 'weeklyDigest', label: 'Weekly Digest', default: false },
    ],
  },
  {
    id: 'push',
    label: 'Push Notifications',
    description: 'Receive browser notifications',
    categories: [
      { id: 'importantUpdates', label: 'Important Updates', default: true },
      { id: 'newFeatures', label: 'New Features', default: false },
      { id: 'recommendations', label: 'Recommendations', default: false },
    ],
  },
  {
    id: 'inApp',
    label: 'In-App Notifications',
    description: 'Receive notifications within the app',
    categories: [
      { id: 'systemAlerts', label: 'System Alerts', default: true },
      { id: 'activityUpdates', label: 'Activity Updates', default: true },
      { id: 'suggestions', label: 'Suggestions', default: false },
    ],
  },
];

// Privacy visibility options
export const PRIVACY_VISIBILITY_OPTIONS = [
  {
    value: 'public',
    label: 'Public',
    description: 'Your profile is visible to everyone',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Your profile is only visible to you',
  },
  {
    value: 'team',
    label: 'Team Only',
    description: 'Your profile is visible to team members',
  },
];

// Step labels for the step indicator
export const STEP_LABELS = [
  'Create Account',
  'Complete Profile',
  'Set Preferences',
  'Welcome',
];

// Default preferences based on locale
export const getDefaultPreferences = (locale: string) => ({
  language: locale,
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h' as const,
  emailNotifications: {
    productUpdates: true,
    securityAlerts: true,
    marketing: false,
    weeklyDigest: false,
  },
  pushNotifications: {
    importantUpdates: true,
    newFeatures: false,
    recommendations: false,
  },
  inAppNotifications: {
    systemAlerts: true,
    activityUpdates: true,
    suggestions: false,
  },
  theme: 'system' as const,
  displayDensity: 'comfortable' as const,
  allowAnalytics: true,
  showProfile: false,
  enableTwoFactor: false,
});

// Mock avatar options (placeholder URLs)
export const AVATAR_OPTIONS = [
  { value: '', label: 'No Avatar' },
  { value: '/avatars/avatar-1.png', label: 'Avatar 1' },
  { value: '/avatars/avatar-2.png', label: 'Avatar 2' },
  { value: '/avatars/avatar-3.png', label: 'Avatar 3' },
  { value: '/avatars/avatar-4.png', label: 'Avatar 4' },
];

// Company size options for profile setup
export const COMPANY_SIZE_OPTIONS = [
  { value: '1', label: 'Just me' },
  { value: '2-10', label: '2-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

// Industry options for profile setup
export const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];
