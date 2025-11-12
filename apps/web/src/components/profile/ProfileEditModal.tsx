'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface WorkExperienceEntry {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  
  // Section collapse states
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    personalInfo: false,
    about: false,
    businessInfo: false,
  });
  
  const [formData, setFormData] = useState({
    username: 'johndoe167',
    displayName: 'John Doe',
    personalTitle: 'Mr.',
    firstName: 'John',
    middleName: 'Michael',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneCountryCode: '+1',
    phoneNumber: '5551234567',
    personalAptSuite: 'Apt 4B',
    personalStreetAddress1: '123 Market Street',
    personalStreetAddress2: '',
    personalCity: 'San Francisco',
    personalState: 'California',
    personalPostalCode: '94102',
    personalCountry: 'United States',
    // About section
    bio: 'Passionate product designer with over 5 years of experience creating beautiful and functional user interfaces.',
    // Business Information
    businessPosition: 'Senior Product Designer',
    businessCompany: 'Tech Innovations Inc.',
    businessAptSuite: 'Suite 200',
    businessStreetAddress1: '456 Tech Boulevard',
    businessStreetAddress2: 'Building A',
    businessCity: 'San Francisco',
    businessState: 'California',
    businessPostalCode: '94103',
    businessCountry: 'United States',
  });

  const [education, setEducation] = useState<EducationEntry[]>([
    {
      id: '1',
      institution: 'Stanford University',
      degree: 'Bachelor of Science in Computer Science',
      startDate: '2015',
      endDate: '2019',
    },
  ]);

  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>([
    {
      id: '1',
      company: 'Previous Company Inc.',
      position: 'Junior Designer',
      startDate: '2019',
      endDate: '2021',
      description: 'Worked on various design projects and collaborated with cross-functional teams.',
    },
  ]);

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
    checkUsernameAvailability(newValue);
  };

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Profile updated:', {
      ...formData,
      education,
      workExperience,
    });
    setShowApprovalPopup(true);
  };

  const handleApprovalClose = () => {
    setShowApprovalPopup(false);
    onClose();
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
    { code: '+93', country: 'Afghanistan' },
    { code: '+355', country: 'Albania' },
    { code: '+213', country: 'Algeria' },
    { code: '+376', country: 'Andorra' },
    { code: '+244', country: 'Angola' },
    { code: '+672', country: 'Antarctica' },
    { code: '+54', country: 'Argentina' },
    { code: '+374', country: 'Armenia' },
    { code: '+297', country: 'Aruba' },
    { code: '+61', country: 'Australia' },
    { code: '+43', country: 'Austria' },
    { code: '+994', country: 'Azerbaijan' },
    { code: '+973', country: 'Bahrain' },
    { code: '+880', country: 'Bangladesh' },
    { code: '+375', country: 'Belarus' },
    { code: '+32', country: 'Belgium' },
    { code: '+501', country: 'Belize' },
    { code: '+229', country: 'Benin' },
    { code: '+975', country: 'Bhutan' },
    { code: '+591', country: 'Bolivia' },
    { code: '+387', country: 'Bosnia and Herzegovina' },
    { code: '+267', country: 'Botswana' },
    { code: '+55', country: 'Brazil' },
    { code: '+246', country: 'British Indian Ocean Territory' },
    { code: '+673', country: 'Brunei' },
    { code: '+359', country: 'Bulgaria' },
    { code: '+226', country: 'Burkina Faso' },
    { code: '+257', country: 'Burundi' },
    { code: '+855', country: 'Cambodia' },
    { code: '+237', country: 'Cameroon' },
    { code: '+1', country: 'Canada' },
    { code: '+238', country: 'Cape Verde' },
    { code: '+236', country: 'Central African Republic' },
    { code: '+235', country: 'Chad' },
    { code: '+56', country: 'Chile' },
    { code: '+86', country: 'China' },
    { code: '+57', country: 'Colombia' },
    { code: '+269', country: 'Comoros' },
    { code: '+682', country: 'Cook Islands' },
    { code: '+506', country: 'Costa Rica' },
    { code: '+385', country: 'Croatia' },
    { code: '+53', country: 'Cuba' },
    { code: '+599', country: 'Curaçao' },
    { code: '+357', country: 'Cyprus' },
    { code: '+420', country: 'Czech Republic' },
    { code: '+243', country: 'Democratic Republic of the Congo' },
    { code: '+45', country: 'Denmark' },
    { code: '+253', country: 'Djibouti' },
    { code: '+593', country: 'Ecuador' },
    { code: '+20', country: 'Egypt' },
    { code: '+503', country: 'El Salvador' },
    { code: '+240', country: 'Equatorial Guinea' },
    { code: '+291', country: 'Eritrea' },
    { code: '+372', country: 'Estonia' },
    { code: '+268', country: 'Eswatini' },
    { code: '+251', country: 'Ethiopia' },
    { code: '+500', country: 'Falkland Islands' },
    { code: '+298', country: 'Faroe Islands' },
    { code: '+679', country: 'Fiji' },
    { code: '+358', country: 'Finland' },
    { code: '+33', country: 'France' },
    { code: '+594', country: 'French Guiana' },
    { code: '+689', country: 'French Polynesia' },
    { code: '+241', country: 'Gabon' },
    { code: '+220', country: 'Gambia' },
    { code: '+995', country: 'Georgia' },
    { code: '+49', country: 'Germany' },
    { code: '+233', country: 'Ghana' },
    { code: '+350', country: 'Gibraltar' },
    { code: '+30', country: 'Greece' },
    { code: '+299', country: 'Greenland' },
    { code: '+590', country: 'Guadeloupe' },
    { code: '+502', country: 'Guatemala' },
    { code: '+224', country: 'Guinea' },
    { code: '+245', country: 'Guinea-Bissau' },
    { code: '+592', country: 'Guyana' },
    { code: '+509', country: 'Haiti' },
    { code: '+504', country: 'Honduras' },
    { code: '+852', country: 'Hong Kong' },
    { code: '+36', country: 'Hungary' },
    { code: '+354', country: 'Iceland' },
    { code: '+91', country: 'India' },
    { code: '+62', country: 'Indonesia' },
    { code: '+98', country: 'Iran' },
    { code: '+964', country: 'Iraq' },
    { code: '+353', country: 'Ireland' },
    { code: '+972', country: 'Israel' },
    { code: '+39', country: 'Italy' },
    { code: '+225', country: 'Ivory Coast' },
    { code: '+81', country: 'Japan' },
    { code: '+962', country: 'Jordan' },
    { code: '+254', country: 'Kenya' },
    { code: '+686', country: 'Kiribati' },
    { code: '+383', country: 'Kosovo' },
    { code: '+965', country: 'Kuwait' },
    { code: '+996', country: 'Kyrgyzstan' },
    { code: '+856', country: 'Laos' },
    { code: '+371', country: 'Latvia' },
    { code: '+961', country: 'Lebanon' },
    { code: '+266', country: 'Lesotho' },
    { code: '+231', country: 'Liberia' },
    { code: '+218', country: 'Libya' },
    { code: '+423', country: 'Liechtenstein' },
    { code: '+370', country: 'Lithuania' },
    { code: '+352', country: 'Luxembourg' },
    { code: '+853', country: 'Macau' },
    { code: '+261', country: 'Madagascar' },
    { code: '+265', country: 'Malawi' },
    { code: '+60', country: 'Malaysia' },
    { code: '+960', country: 'Maldives' },
    { code: '+223', country: 'Mali' },
    { code: '+356', country: 'Malta' },
    { code: '+692', country: 'Marshall Islands' },
    { code: '+596', country: 'Martinique' },
    { code: '+222', country: 'Mauritania' },
    { code: '+230', country: 'Mauritius' },
    { code: '+52', country: 'Mexico' },
    { code: '+691', country: 'Micronesia' },
    { code: '+373', country: 'Moldova' },
    { code: '+377', country: 'Monaco' },
    { code: '+976', country: 'Mongolia' },
    { code: '+382', country: 'Montenegro' },
    { code: '+212', country: 'Morocco' },
    { code: '+258', country: 'Mozambique' },
    { code: '+95', country: 'Myanmar' },
    { code: '+264', country: 'Namibia' },
    { code: '+674', country: 'Nauru' },
    { code: '+977', country: 'Nepal' },
    { code: '+31', country: 'Netherlands' },
    { code: '+687', country: 'New Caledonia' },
    { code: '+64', country: 'New Zealand' },
    { code: '+505', country: 'Nicaragua' },
    { code: '+227', country: 'Niger' },
    { code: '+234', country: 'Nigeria' },
    { code: '+683', country: 'Niue' },
    { code: '+850', country: 'North Korea' },
    { code: '+389', country: 'North Macedonia' },
    { code: '+47', country: 'Norway' },
    { code: '+968', country: 'Oman' },
    { code: '+92', country: 'Pakistan' },
    { code: '+680', country: 'Palau' },
    { code: '+970', country: 'Palestine' },
    { code: '+507', country: 'Panama' },
    { code: '+675', country: 'Papua New Guinea' },
    { code: '+595', country: 'Paraguay' },
    { code: '+51', country: 'Peru' },
    { code: '+63', country: 'Philippines' },
    { code: '+48', country: 'Poland' },
    { code: '+351', country: 'Portugal' },
    { code: '+974', country: 'Qatar' },
    { code: '+242', country: 'Republic of the Congo' },
    { code: '+262', country: 'Réunion' },
    { code: '+40', country: 'Romania' },
    { code: '+7', country: 'Russia' },
    { code: '+250', country: 'Rwanda' },
    { code: '+290', country: 'Saint Helena' },
    { code: '+508', country: 'Saint Pierre and Miquelon' },
    { code: '+685', country: 'Samoa' },
    { code: '+378', country: 'San Marino' },
    { code: '+239', country: 'Sao Tome and Principe' },
    { code: '+966', country: 'Saudi Arabia' },
    { code: '+221', country: 'Senegal' },
    { code: '+381', country: 'Serbia' },
    { code: '+248', country: 'Seychelles' },
    { code: '+232', country: 'Sierra Leone' },
    { code: '+65', country: 'Singapore' },
    { code: '+421', country: 'Slovakia' },
    { code: '+386', country: 'Slovenia' },
    { code: '+677', country: 'Solomon Islands' },
    { code: '+252', country: 'Somalia' },
    { code: '+27', country: 'South Africa' },
    { code: '+82', country: 'South Korea' },
    { code: '+34', country: 'Spain' },
    { code: '+94', country: 'Sri Lanka' },
    { code: '+249', country: 'Sudan' },
    { code: '+597', country: 'Suriname' },
    { code: '+46', country: 'Sweden' },
    { code: '+41', country: 'Switzerland' },
    { code: '+963', country: 'Syria' },
    { code: '+886', country: 'Taiwan' },
    { code: '+992', country: 'Tajikistan' },
    { code: '+255', country: 'Tanzania' },
    { code: '+66', country: 'Thailand' },
    { code: '+670', country: 'Timor-Leste' },
    { code: '+228', country: 'Togo' },
    { code: '+690', country: 'Tokelau' },
    { code: '+676', country: 'Tonga' },
    { code: '+216', country: 'Tunisia' },
    { code: '+90', country: 'Turkey' },
    { code: '+993', country: 'Turkmenistan' },
    { code: '+688', country: 'Tuvalu' },
    { code: '+256', country: 'Uganda' },
    { code: '+380', country: 'Ukraine' },
    { code: '+971', country: 'United Arab Emirates' },
    { code: '+44', country: 'United Kingdom' },
    { code: '+1', country: 'United States' },
    { code: '+598', country: 'Uruguay' },
    { code: '+998', country: 'Uzbekistan' },
    { code: '+678', country: 'Vanuatu' },
    { code: '+379', country: 'Vatican City' },
    { code: '+58', country: 'Venezuela' },
    { code: '+84', country: 'Vietnam' },
    { code: '+681', country: 'Wallis and Futuna' },
    { code: '+967', country: 'Yemen' },
    { code: '+260', country: 'Zambia' },
    { code: '+263', country: 'Zimbabwe' },
  ].sort((a, b) => a.country.localeCompare(b.country));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border shadow-2xl modal-bg text-card-foreground"
      >
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 modal-bg z-10">
          <h2 className="text-2xl font-bold text-card-foreground">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-all"
          >
            <X className="h-5 w-5 text-card-foreground/70" />
          </button>
            </div>
            
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                      placeholder="Enter username"
                />
              </div>
              <div className="flex-1 flex items-center h-[42px]">
                {usernameStatus === 'checking' && (
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                        Checking...
                  </span>
                )}
                {usernameStatus === 'available' && (
                  <span className="text-sm text-success flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                        Available
                  </span>
                )}
                {usernameStatus === 'taken' && (
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
            
                {/* Second Line: Email and Phone Number - NOW EDITABLE */}
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
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
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
                        className="w-48 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
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
                        className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Third Line: Apartment/Suite and Street Address */}
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
            
            {/* Fourth Line: Street Address 2 */}
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
            
            {/* Fifth Line: City, State/Region, Postal Code, Country */}
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

          {/* About Section */}
          <div className="space-y-4 border-b border-border pb-6">
            <button
              type="button"
              className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              onClick={() => toggleSection('about')}
            >
              <span>About</span>
              {sectionsCollapsed.about ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </button>
            
            {!sectionsCollapsed.about && (
              <div className="space-y-6">
                {/* Bio */}
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

                {/* Education */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-card-foreground">
                      Education
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addEducation}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Education
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {education.map((entry, index) => (
                      <div key={entry.id} className="p-4 border border-border rounded-lg space-y-3 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-card-foreground">Education {index + 1}</span>
                          {education.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(entry.id)}
                              className="text-danger hover:text-danger/80"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid gap-3">
                          <input
                            type="text"
                            value={entry.institution}
                            onChange={(e) => updateEducation(entry.id, 'institution', e.target.value)}
                            placeholder="Institution name"
                            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                          />
                          <input
                            type="text"
                            value={entry.degree}
                            onChange={(e) => updateEducation(entry.id, 'degree', e.target.value)}
                            placeholder="Degree / Field of study"
                            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={entry.startDate}
                              onChange={(e) => updateEducation(entry.id, 'startDate', e.target.value)}
                              placeholder="Start year (e.g., 2015)"
                              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                            />
                            <input
                              type="text"
                              value={entry.endDate}
                              onChange={(e) => updateEducation(entry.id, 'endDate', e.target.value)}
                              placeholder="End year (e.g., 2019)"
                              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work Experience */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-card-foreground">
                      Work Experience
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addWorkExperience}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Experience
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {workExperience.map((entry, index) => (
                      <div key={entry.id} className="p-4 border border-border rounded-lg space-y-3 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-card-foreground">Experience {index + 1}</span>
                          {workExperience.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWorkExperience(entry.id)}
                              className="text-danger hover:text-danger/80"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid gap-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={entry.position}
                              onChange={(e) => updateWorkExperience(entry.id, 'position', e.target.value)}
                              placeholder="Position / Title"
                              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                            />
                            <input
                              type="text"
                              value={entry.company}
                              onChange={(e) => updateWorkExperience(entry.id, 'company', e.target.value)}
                              placeholder="Company name"
                              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={entry.startDate}
                              onChange={(e) => updateWorkExperience(entry.id, 'startDate', e.target.value)}
                              placeholder="Start year (e.g., 2019)"
                              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                            />
                            <input
                              type="text"
                              value={entry.endDate}
                              onChange={(e) => updateWorkExperience(entry.id, 'endDate', e.target.value)}
                              placeholder="End year (e.g., 2021)"
                              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                            />
                          </div>
                          <textarea
                            value={entry.description}
                            onChange={(e) => updateWorkExperience(entry.id, 'description', e.target.value)}
                            rows={3}
                            placeholder="Description (optional)"
                            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Business Information Section */}
          <div className="space-y-4">
            <button
              type="button"
              className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              onClick={() => toggleSection('businessInfo')}
            >
              <span>Business Information</span>
              {sectionsCollapsed.businessInfo ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </button>
            
            {!sectionsCollapsed.businessInfo && (
              <div className="space-y-4">
                {/* Position and Company Name */}
                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      value={formData.businessPosition}
                      onChange={(e) => setFormData({ ...formData, businessPosition: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                      placeholder="Your position"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.businessCompany}
                      onChange={(e) => setFormData({ ...formData, businessCompany: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                      placeholder="Company name"
                    />
                  </div>
                </div>

                {/* Business Address - Same as Personal */}
                <div className="grid gap-4 grid-cols-5">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Apartment/Suite
                    </label>
                    <input
                      type="text"
                      value={formData.businessAptSuite}
                      onChange={(e) => setFormData({ ...formData, businessAptSuite: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.businessStreetAddress1}
                      onChange={(e) => setFormData({ ...formData, businessStreetAddress1: e.target.value })}
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
                    value={formData.businessStreetAddress2}
                    onChange={(e) => setFormData({ ...formData, businessStreetAddress2: e.target.value })}
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
                      value={formData.businessCity}
                      onChange={(e) => setFormData({ ...formData, businessCity: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      State/Region
                    </label>
                    <input
                      type="text"
                      value={formData.businessState}
                      onChange={(e) => setFormData({ ...formData, businessState: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.businessPostalCode}
                      onChange={(e) => setFormData({ ...formData, businessPostalCode: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Country
                    </label>
                    <select
                      value={formData.businessCountry}
                      onChange={(e) => setFormData({ ...formData, businessCountry: e.target.value })}
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

          {/* Form Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t border-border sticky bottom-0 modal-bg pb-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
      
      {/* Success Popup */}
      {showApprovalPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-md rounded-lg border shadow-2xl modal-bg text-card-foreground p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">Changes Saved</h3>
            </div>
            <p className="text-sm text-card-foreground/70 mb-6">
              Your profile changes have been saved successfully.
            </p>
            <div className="flex justify-end">
              <Button onClick={handleApprovalClose}>
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
