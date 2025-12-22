'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronDown, ChevronUp, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingData, EducationEntry, WorkExperienceEntry } from '@/hooks/useOnboarding';
import { generateUsername, checkUsernameAvailability } from '@/utils/onboarding-client';
import { completeOnboardingStep2 } from '@/app/actions/profile';

interface Step2Props {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function Step2CompleteProfile({ data, updateData, onNext, onBack, onSkip }: Step2Props) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'en';
  
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    personalInfo: false,
    about: true,
    businessInfo: true,
  });

  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'checking' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [education, setEducation] = useState<EducationEntry[]>(
    data.education && data.education.length > 0 ? data.education : [
      { id: '1', institution: '', degree: '', startDate: '', endDate: '' }
    ]
  );
  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(
    data.workExperience && data.workExperience.length > 0 ? data.workExperience : [
      { id: '1', company: '', position: '', startDate: '', endDate: '', description: '' }
    ]
  );

  // Auto-suggest username on mount
  useEffect(() => {
    if (!data.username && (data.email || data.phoneNumber)) {
      const suggested = generateUsername(data.email, data.phoneNumber);
      updateData({ username: suggested });
    }
  }, [data.email, data.phoneNumber, data.username, updateData]);

  const toggleSection = (section: keyof typeof sectionsCollapsed) => {
    setSectionsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleUsernameChange = async (value: string) => {
    updateData({ username: value });
    
    if (value.length >= 3) {
      setUsernameStatus('checking');
      const isAvailable = await checkUsernameAvailability(value);
      setUsernameStatus(isAvailable ? 'available' : 'taken');
    } else {
      setUsernameStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    const formData = new FormData();
    formData.append('username', data.username || '');
    formData.append('first_name', data.firstName || '');
    formData.append('last_name', data.lastName || '');
    formData.append('display_name', data.displayName || '');
    formData.append('locale', locale);
    
    const result = await completeOnboardingStep2(formData);
    
    if (result.error) {
      setErrors(result.error);
      setIsSubmitting(false);
      return;
    }
    
    if (result.success && result.redirectTo) {
      router.push(result.redirectTo);
    }
  };

  const personalTitles = ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.', 'Prof.', 'Rev.', 'Other'];
  const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Japan', 'China', 'India', 'Brazil', 'Mexico'].sort();

  const isEmailLocked = data.authMethod === 'email';
  const isPhoneLocked = data.authMethod === 'phone';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {errors.form && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {errors.form.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}
      
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
            {/* Display Name and Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={data.displayName || ''}
                  onChange={(e) => updateData({ displayName: e.target.value })}
                  placeholder="Enter display name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="username">Username *</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={data.username || ''}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="Enter username"
                    required
                  />
                  {usernameStatus === 'checking' && (
                    <span className="text-sm text-muted-foreground self-center whitespace-nowrap">Checking...</span>
                  )}
                  {usernameStatus === 'available' && (
                    <span className="text-sm text-green-600 self-center">✓</span>
                  )}
                  {usernameStatus === 'taken' && (
                    <span className="text-sm text-red-600 self-center">✗</span>
                  )}
                </div>
                {errors.username && (
                  <p className="text-sm text-destructive mt-1">{errors.username[0]}</p>
                )}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Select value={data.personalTitle} onValueChange={(value) => updateData({ personalTitle: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {personalTitles.map((title) => (
                      <SelectItem key={title} value={title}>{title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={data.firstName || ''}
                  onChange={(e) => updateData({ firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={data.middleName || ''}
                  onChange={(e) => updateData({ middleName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={data.lastName || ''}
                  onChange={(e) => updateData({ lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email || ''}
                  onChange={(e) => updateData({ email: e.target.value })}
                  readOnly={isEmailLocked}
                  className={isEmailLocked ? 'bg-muted cursor-not-allowed' : ''}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={data.phoneNumber || ''}
                  onChange={(e) => updateData({ phoneNumber: e.target.value })}
                  readOnly={isPhoneLocked}
                  className={isPhoneLocked ? 'bg-muted cursor-not-allowed' : ''}
                />
              </div>
            </div>

            {/* Address Fields - Collapsible */}
            <div className="space-y-2">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                onClick={() => {
                  const addressSection = document.getElementById('address-section');
                  if (addressSection) {
                    addressSection.classList.toggle('hidden');
                  }
                }}
              >
                <ChevronDown className="h-4 w-4" />
                Add address (Optional)
              </button>
              <div id="address-section" className="hidden space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label>Apt/Suite</Label>
                    <Input
                      value={data.personalAptSuite || ''}
                      onChange={(e) => updateData({ personalAptSuite: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Label>Street Address</Label>
                    <Input
                      value={data.personalStreetAddress1 || ''}
                      onChange={(e) => updateData({ personalStreetAddress1: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={data.personalCity || ''}
                      onChange={(e) => updateData({ personalCity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={data.personalState || ''}
                      onChange={(e) => updateData({ personalState: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Postal Code</Label>
                    <Input
                      value={data.personalPostalCode || ''}
                      onChange={(e) => updateData({ personalPostalCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Select value={data.personalCountry} onValueChange={(value) => updateData({ personalCountry: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
          <span>About <span className="text-sm text-muted-foreground font-normal">(Optional)</span></span>
          {sectionsCollapsed.about ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>
        
        {!sectionsCollapsed.about && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={data.bio || ''}
                onChange={(e) => updateData({ bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              You can add education and work experience details later in your profile settings.
            </p>
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
          <span>Business Information <span className="text-sm text-muted-foreground font-normal">(Optional)</span></span>
          {sectionsCollapsed.businessInfo ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>
        
        {!sectionsCollapsed.businessInfo && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={data.businessPosition || ''}
                  onChange={(e) => updateData({ businessPosition: e.target.value })}
                  placeholder="Your position"
                />
              </div>
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={data.businessCompany || ''}
                  onChange={(e) => updateData({ businessCompany: e.target.value })}
                  placeholder="Company name"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !data.username || !data.displayName || !data.firstName || !data.lastName || (!data.email && !data.phoneNumber)}
          >
            {isSubmitting ? 'Completing...' : 'Complete Setup'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}

