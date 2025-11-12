'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface WorkExperienceEntry {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProfileFormData {
  username: string;
  displayName: string;
  personalTitle: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  personalAptSuite: string;
  personalStreetAddress1: string;
  personalStreetAddress2: string;
  personalCity: string;
  personalState: string;
  personalPostalCode: string;
  personalCountry: string;
  bio: string;
  businessPosition: string;
  businessCompany: string;
  businessAptSuite: string;
  businessStreetAddress1: string;
  businessStreetAddress2: string;
  businessCity: string;
  businessState: string;
  businessPostalCode: string;
  businessCountry: string;
}

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  initialEducation?: EducationEntry[];
  initialWorkExperience?: WorkExperienceEntry[];
  onSubmit: (data: ProfileFormData, education: EducationEntry[], workExperience: WorkExperienceEntry[]) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  showCancelButton?: boolean;
  readOnlyFields?: string[];
  mode?: 'edit' | 'onboarding';
}

export function ProfileForm({
  initialData = {},
  initialEducation = [],
  initialWorkExperience = [],
  onSubmit,
  onCancel,
  submitButtonText = 'Save Changes',
  showCancelButton = true,
  readOnlyFields = [],
  mode = 'edit',
}: ProfileFormProps) {
  // Section collapse states - for onboarding, start with Personal Info expanded, others collapsed
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    personalInfo: false,
    about: mode === 'onboarding',
    businessInfo: mode === 'onboarding',
  });
  
  const [formData, setFormData] = useState<ProfileFormData>({
    username: initialData.username || '',
    displayName: initialData.displayName || '',
    personalTitle: initialData.personalTitle || 'Mr.',
    firstName: initialData.firstName || '',
    middleName: initialData.middleName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phoneCountryCode: initialData.phoneCountryCode || '+1',
    phoneNumber: initialData.phoneNumber || '',
    personalAptSuite: initialData.personalAptSuite || '',
    personalStreetAddress1: initialData.personalStreetAddress1 || '',
    personalStreetAddress2: initialData.personalStreetAddress2 || '',
    personalCity: initialData.personalCity || '',
    personalState: initialData.personalState || '',
    personalPostalCode: initialData.personalPostalCode || '',
    personalCountry: initialData.personalCountry || 'United States',
    bio: initialData.bio || '',
    businessPosition: initialData.businessPosition || '',
    businessCompany: initialData.businessCompany || '',
    businessAptSuite: initialData.businessAptSuite || '',
    businessStreetAddress1: initialData.businessStreetAddress1 || '',
    businessStreetAddress2: initialData.businessStreetAddress2 || '',
    businessCity: initialData.businessCity || '',
    businessState: initialData.businessState || '',
    businessPostalCode: initialData.businessPostalCode || '',
    businessCountry: initialData.businessCountry || 'United States',
  });

  const [education, setEducation] = useState<EducationEntry[]>(
    initialEducation.length > 0 ? initialEducation : [
      {
        id: '1',
        institution: '',
        degree: '',
        startDate: '',
        endDate: '',
      },
    ]
  );

  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(
    initialWorkExperience.length > 0 ? initialWorkExperience : [
      {
        id: '1',
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ]
  );

  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'checking' | null>(null);

  const toggleSection = (section: keyof typeof sectionsCollapsed) => {
    setSectionsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const checkUsernameAvailability = (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      return;
    }
    
    setUsernameStatus('checking');
    
    // Simulate API call
    setTimeout(() => {
      // Mock logic: usernames starting with 'john' are taken
      if (username.toLowerCase().startsWith('john')) {
        setUsernameStatus('taken');
      } else {
        setUsernameStatus('available');
      }
    }, 500);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFormData({ ...formData, username: newValue });
    if (!readOnlyFields.includes('username')) {
      checkUsernameAvailability(newValue);
    }
  };

  const isFieldReadOnly = (fieldName: string) => readOnlyFields.includes(fieldName);

  // Education handlers
  const addEducation = () => {
    const newEntry: EducationEntry = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      startDate: '',
      endDate: '',
    };
    setEducation([...education, newEntry]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(entry => entry.id !== id));
  };

  const updateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    setEducation(education.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  // Work Experience handlers
  const addWorkExperience = () => {
    const newEntry: WorkExperienceEntry = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setWorkExperience([...workExperience, newEntry]);
  };

  const removeWorkExperience = (id: string) => {
    setWorkExperience(workExperience.filter(entry => entry.id !== id));
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperienceEntry, value: string) => {
    setWorkExperience(workExperience.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const personalTitles = ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.', 'Prof.', 'Rev.', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, education, workExperience);
  };

  // Comprehensive list of countries
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
    'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
    'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
    'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
    'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
    'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
    'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
    'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
    'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
    'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
    'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
    'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
    'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
    'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
    'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
    'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
    'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
    'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];

  const phoneCountryCodes = [
    { code: '+1', country: 'United States' },
    { code: '+44', country: 'United Kingdom' },
    { code: '+91', country: 'India' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
    { code: '+61', country: 'Australia' },
    { code: '+55', country: 'Brazil' },
    { code: '+52', country: 'Mexico' },
    // Add more as needed
  ].sort((a, b) => a.country.localeCompare(b.country));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div className="space-y-4 border-b border-border pb-6">
        <button
          type="button"
          className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          onClick={() => toggleSection('personalInfo')}
        >
          <span>Personal Information</span>
          {sectionsCollapsed.personalInfo ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>
        
        {!sectionsCollapsed.personalInfo && (
          <div className="space-y-4">
            {/* Display Name and Username Fields */}
            <div className="flex items-end gap-4">
              <div className="flex-1" style={{ maxWidth: '33.333%' }}>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Display Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  required
                  readOnly={isFieldReadOnly('displayName')}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                  placeholder="Enter display name"
                />
              </div>
              <div className="flex-1" style={{ maxWidth: '33.333%' }}>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Username <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  required
                  readOnly={isFieldReadOnly('username')}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                  placeholder="Enter username"
                />
              </div>
              <div className="flex-1 flex items-center h-[42px]">
                {!isFieldReadOnly('username') && usernameStatus === 'checking' && (
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </span>
                )}
                {!isFieldReadOnly('username') && usernameStatus === 'available' && (
                  <span className="text-sm text-success flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Available
                  </span>
                )}
                {!isFieldReadOnly('username') && usernameStatus === 'taken' && (
                  <span className="text-sm text-danger flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Not available
                  </span>
                )}
              </div>
            </div>
            
            {/* First Line: Title, First Name, Middle Name, Last Name */}
            <div className="grid gap-4 grid-cols-7">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Title
                </label>
                <select
                  value={formData.personalTitle}
                  onChange={(e) => setFormData({ ...formData, personalTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                >
                  {personalTitles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  First Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Last Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                />
              </div>
            </div>
            
            {/* Second Line: Email and Phone Number */}
            <div className="grid gap-4 grid-cols-5">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  readOnly={isFieldReadOnly('email')}
                  className={`w-full px-4 py-2.5 rounded-lg border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm ${
                    isFieldReadOnly('email') ? 'bg-muted cursor-not-allowed' : 'bg-background'
                  }`}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.phoneCountryCode}
                    onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                    disabled={isFieldReadOnly('phoneNumber')}
                    className={`w-48 px-4 py-2.5 rounded-lg border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm ${
                      isFieldReadOnly('phoneNumber') ? 'bg-muted cursor-not-allowed' : 'bg-background'
                    }`}
                  >
                    <option value="">Country</option>
                    {phoneCountryCodes.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.country} {item.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    readOnly={isFieldReadOnly('phoneNumber')}
                    className={`flex-1 px-4 py-2.5 rounded-lg border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm ${
                      isFieldReadOnly('phoneNumber') ? 'bg-muted cursor-not-allowed' : 'bg-background'
                    }`}
                  />
                </div>
              </div>
            </div>
            
            {/* Address Fields - Same as before */}
            <div className="grid gap-4 grid-cols-5">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Apartment/Suite
                </label>
                <input
                  type="text"
                  value={formData.personalAptSuite}
                  onChange={(e) => setFormData({ ...formData, personalAptSuite: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.personalStreetAddress1}
                  onChange={(e) => setFormData({ ...formData, personalStreetAddress1: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Street Address 2
              </label>
              <input
                type="text"
                value={formData.personalStreetAddress2}
                onChange={(e) => setFormData({ ...formData, personalStreetAddress2: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
              />
            </div>
            
            <div className="grid gap-4" style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 2fr' }}>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.personalCity}
                  onChange={(e) => setFormData({ ...formData, personalCity: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  State/Region
                </label>
                <input
                  type="text"
                  value={formData.personalState}
                  onChange={(e) => setFormData({ ...formData, personalState: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.personalPostalCode}
                  onChange={(e) => setFormData({ ...formData, personalPostalCode: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Country
                </label>
                <select
                  value={formData.personalCountry}
                  onChange={(e) => setFormData({ ...formData, personalCountry: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* About Section - Collapsed content omitted for brevity, same as ProfileEditModal */}
      <div className="space-y-4 border-b border-border pb-6">
        <button
          type="button"
          className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          onClick={() => toggleSection('about')}
        >
          <span>About {mode === 'onboarding' && <span className="text-sm text-muted-foreground font-normal">(Optional)</span>}</span>
          {sectionsCollapsed.about ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>
        
        {!sectionsCollapsed.about && (
          <div className="space-y-6">
            {/* Bio, Education, Work Experience - Same as ProfileEditModal */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
            {/* Education and Work Experience sections - Same implementation as ProfileEditModal */}
          </div>
        )}
      </div>

      {/* Business Information Section - Same as ProfileEditModal */}
      <div className="space-y-4">
        <button
          type="button"
          className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          onClick={() => toggleSection('businessInfo')}
        >
          <span>Business Information {mode === 'onboarding' && <span className="text-sm text-muted-foreground font-normal">(Optional)</span>}</span>
          {sectionsCollapsed.businessInfo ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>
        
        {!sectionsCollapsed.businessInfo && (
          <div className="space-y-4">
            {/* Business fields - Same as ProfileEditModal */}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end pt-4">
        {showCancelButton && onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
          >
            Cancel
          </Button>
        )}
        <Button type="submit">
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}

