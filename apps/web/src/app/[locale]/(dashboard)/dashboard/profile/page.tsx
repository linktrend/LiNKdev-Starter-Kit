'use client';

import { useState, useMemo } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Award, Activity, Camera, Building2, Briefcase, Shield, UserCog, BadgeCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const profileData = useMemo(() => ({
    personalTitle: 'Mr.',
    name: 'John',
    middleName: 'Michael',
    lastName: 'Doe',
    displayName: 'John Doe',
    username: 'johndoe167',
    email: 'john.doe@example.com',
    phoneCountryCode: '+1',
    phoneNumber: '5551234567',
    aptSuite: 'Apt 4B',
    streetAddress1: '123 Market Street',
    streetAddress2: '',
    country: 'United States',
    postalCode: '94102',
    region: 'California',
    city: 'San Francisco',
    jobTitle: 'Senior Product Designer',
    company: 'Tech Innovations Inc.',
    bio: 'Passionate product designer with over 5 years of experience creating beautiful and functional user interfaces. I love working with modern design systems and bringing creative ideas to life through thoughtful design and collaboration.',
  }), []);

  const accountInfo = useMemo(() => ({
    accountCreated: 'March 15, 2020 at 05:00 PM',
    adminLevel: 'Super Admin',
    profileStatus: 'Active',
    twoFactorEnabled: false,
  }), []);

  const fullName = `${profileData.name} ${profileData.middleName ? profileData.middleName + ' ' : ''}${profileData.lastName}`;
  const fullPhone = profileData.phoneNumber ? `${profileData.phoneCountryCode} ${profileData.phoneNumber}` : '';
  
  // Build complete address
  const addressParts = [];
  if (profileData.aptSuite) addressParts.push(profileData.aptSuite);
  if (profileData.streetAddress1) addressParts.push(profileData.streetAddress1);
  const streetLine = addressParts.join(', ');
  const cityLine = `${profileData.city}, ${profileData.region} ${profileData.postalCode}`;
  const fullAddressLine1 = streetLine;
  const fullAddressLine2 = cityLine;
  const fullAddressLine3 = profileData.country;

  // Calculate profile completion percentage
  const profileCompletion = useMemo(() => {
    const fields = [
      profileData.personalTitle,
      profileData.name,
      profileData.lastName,
      profileData.displayName,
      profileData.username,
      profileData.email,
      profileData.phoneNumber,
      profileData.jobTitle,
      profileData.company,
      profileData.streetAddress1,
      profileData.city,
      profileData.region,
      profileData.postalCode,
      profileData.country,
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    const percentage = Math.round((filledFields / fields.length) * 100);
    
    return { percentage, filledFields, totalFields: fields.length };
  }, [profileData]);

  return (
    <>
      <ProfileEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      
      <div>
        <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Avatar, Display Name, Username, Edit Button */}
          <div
            className="md:col-span-1 p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex flex-col items-center text-center">
              <div 
                className="relative w-24 h-24 rounded-full bg-white/20 border-4 border-white/60 flex items-center justify-center overflow-hidden mb-4 cursor-pointer group hover:bg-white/30 transition-all"
              >
                <User className="w-12 h-12 text-card-foreground" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-card-foreground mb-1">{profileData.displayName}</h2>
              <p className="text-sm text-card-foreground/60 mb-4">@{profileData.username}</p>
              <Button onClick={() => setIsEditModalOpen(true)}>
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Card 2: User Information */}
          <div
            className="md:col-span-2 p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-card-foreground">
                  {profileData.personalTitle ? `${profileData.personalTitle} ` : ''}{fullName || <span className="text-card-foreground/40">Name not provided</span>}
                </h3>
              </div>
              {profileCompletion.percentage < 100 && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-card-foreground/70">
                    Profile {profileCompletion.percentage}% complete
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${profileCompletion.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 flex-shrink-0 text-card-foreground/60" />
                <div>
                  <span className={`font-medium ${profileData.jobTitle ? 'text-card-foreground' : 'text-card-foreground/40'}`}>
                    {profileData.jobTitle || 'Job title not provided'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 flex-shrink-0 text-card-foreground/60" />
                <span className={profileData.company ? 'text-card-foreground/80' : 'text-card-foreground/40'}>
                  {profileData.company || 'Company not provided'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0 text-card-foreground/60" />
                <span className={profileData.email ? 'text-card-foreground/80' : 'text-card-foreground/40'}>
                  {profileData.email || 'Email not provided'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 flex-shrink-0 text-card-foreground/60" />
                <span className={fullPhone ? 'text-card-foreground/80' : 'text-card-foreground/40'}>
                  {fullPhone || 'Phone not provided'}
                </span>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-card-foreground/60" />
                <div className={fullAddressLine1 || fullAddressLine2 ? 'text-card-foreground/80' : 'text-card-foreground/40'}>
                  {fullAddressLine1 && <div>{fullAddressLine1}</div>}
                  {fullAddressLine2 ? (
                    <>
                      <div>{fullAddressLine2}</div>
                      <div>{fullAddressLine3}</div>
                    </>
                  ) : (
                    <div>Address not provided</div>
                  )}
                </div>
              </div>
            </div>
            
            {profileCompletion.percentage < 100 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-card-foreground/60">
                  Complete your profile to unlock all features. {profileCompletion.totalFields - profileCompletion.filledFields} fields remaining.
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <h3 className="text-xl font-bold text-card-foreground mb-2">Account Information</h3>
          <p className="text-sm text-card-foreground/70 mb-6">Administrative account details and settings</p>
          
          <div className="space-y-6">
            {/* Account Details Section */}
            <div>
              <h4 className="text-sm font-semibold text-card-foreground/90 mb-4 flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Account Details
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-card-foreground/60" />
                  <div>
                    <span className="text-card-foreground/70">Account Created:</span>
                    <span className="text-card-foreground ml-2">{accountInfo.accountCreated}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 flex-shrink-0 text-card-foreground/60" />
                  <div>
                    <span className="text-card-foreground/70">Admin Level:</span>
                    <span className="text-card-foreground ml-2">{accountInfo.adminLevel}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <BadgeCheck className="h-4 w-4 flex-shrink-0 text-card-foreground/60" />
                  <div>
                    <span className="text-card-foreground/70">Profile Status:</span>
                    <span className="text-card-foreground ml-2">{accountInfo.profileStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings Section */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-card-foreground/90 mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Security Settings
              </h4>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 flex-shrink-0 text-card-foreground/60" />
                <div>
                  <span className="text-card-foreground/70">2FA Status:</span>
                  <span className={`ml-2 ${accountInfo.twoFactorEnabled ? 'text-green-500' : 'text-orange-500'}`}>
                    {accountInfo.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <h3 className="text-xl font-bold text-card-foreground mb-2">Recent Activity</h3>
          <p className="text-sm text-card-foreground/70 mb-6">Your latest actions and updates</p>
          
          <div className="py-8 text-center">
            <p className="text-card-foreground/50">No recent activity to display</p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

