'use client';

import { useState, useMemo } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Award, Activity, Camera, Building2, Briefcase, Shield, Users, Settings, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';

export default function ConsoleProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const adminProfileData = useMemo(() => ({
    personalTitle: 'Dr.',
    name: 'Sarah',
    middleName: 'Elizabeth',
    lastName: 'Johnson',
    displayName: 'Sarah Johnson',
    username: 'sarah.admin',
    email: 'sarah.johnson@company.com',
    phoneCountryCode: '+1',
    phoneNumber: '5559876543',
    aptSuite: 'Suite 100',
    streetAddress1: '456 Admin Plaza',
    streetAddress2: 'Floor 15',
    country: 'United States',
    postalCode: '10001',
    region: 'New York',
    city: 'New York',
    jobTitle: 'Senior System Administrator',
    company: 'TechCorp Solutions',
    bio: 'Experienced system administrator with over 8 years of experience managing enterprise-level systems and infrastructure. Passionate about security, automation, and ensuring optimal system performance.',
    adminLevel: 'Super Admin',
    permissions: ['User Management', 'System Configuration', 'Database Access', 'Security Settings'],
    lastLogin: '2024-01-27T10:30:00Z',
    accountCreated: '2020-03-15T09:00:00Z',
  }), []);

  const adminStats = [
    { label: 'Users Managed', value: '1,247', icon: Users },
    { label: 'Systems Monitored', value: '23', icon: Database },
    { label: 'Security Events', value: '156', icon: Shield },
  ];

  const fullName = `${adminProfileData.name} ${adminProfileData.middleName ? adminProfileData.middleName + ' ' : ''}${adminProfileData.lastName}`;
  const fullPhone = adminProfileData.phoneNumber ? `${adminProfileData.phoneCountryCode} ${adminProfileData.phoneNumber}` : '';
  
  // Build complete address
  const addressParts = [];
  if (adminProfileData.aptSuite) addressParts.push(adminProfileData.aptSuite);
  if (adminProfileData.streetAddress1) addressParts.push(adminProfileData.streetAddress1);
  const streetLine = addressParts.join(', ');
  const cityLine = `${adminProfileData.city}, ${adminProfileData.region} ${adminProfileData.postalCode}`;
  const fullAddressLine1 = streetLine;
  const fullAddressLine2 = cityLine;
  const fullAddressLine3 = adminProfileData.country;

  // Calculate profile completion percentage
  const profileCompletion = useMemo(() => {
    const fields = [
      adminProfileData.personalTitle,
      adminProfileData.name,
      adminProfileData.lastName,
      adminProfileData.displayName,
      adminProfileData.username,
      adminProfileData.email,
      adminProfileData.phoneNumber,
      adminProfileData.jobTitle,
      adminProfileData.company,
      adminProfileData.streetAddress1,
      adminProfileData.city,
      adminProfileData.region,
      adminProfileData.postalCode,
      adminProfileData.country,
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    const percentage = Math.round((filledFields / fields.length) * 100);
    
    return { percentage, filledFields, totalFields: fields.length };
  }, [adminProfileData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              <h2 className="text-2xl font-bold text-card-foreground mb-1">{adminProfileData.displayName}</h2>
              <p className="text-sm text-card-foreground/60 mb-2">@{adminProfileData.username}</p>
              <Button onClick={() => setIsEditModalOpen(true)}>
                Edit Profile
              </Button>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-xs text-success font-medium">Verified</span>
              </div>
            </div>
          </div>

          {/* Card 2: Admin Information */}
          <div
            className="md:col-span-2 p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-card-foreground">
                  {adminProfileData.personalTitle ? `${adminProfileData.personalTitle} ` : ''}{fullName || <span className="text-card-foreground/40">Name not provided</span>}
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
                  <span className={`font-medium ${adminProfileData.jobTitle ? 'text-card-foreground' : 'text-card-foreground/40'}`}>
                    {adminProfileData.jobTitle || 'Job title not provided'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 flex-shrink-0 text-card-foreground/60" />
                <span className={adminProfileData.company ? 'text-card-foreground/80' : 'text-card-foreground/40'}>
                  {adminProfileData.company || 'Company not provided'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0 text-card-foreground/60" />
                <span className={adminProfileData.email ? 'text-card-foreground/80' : 'text-card-foreground/40'}>
                  {adminProfileData.email || 'Email not provided'}
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
          <h3 className="text-xl font-bold text-card-foreground mb-2">Administrative Statistics</h3>
          <p className="text-sm text-card-foreground/70 mb-6">Your administrative activity and system metrics</p>
          
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {adminStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                  <Icon className="h-5 w-5 text-primary mb-2" />
                  <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                  <div className="text-sm text-card-foreground/70">{stat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-lg bg-white/5">
            <h4 className="text-sm font-semibold text-card-foreground/50 mb-3">Admin Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {adminProfileData.permissions.map((permission, index) => (
                <span key={index} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <h3 className="text-xl font-bold text-card-foreground mb-2">Account Information</h3>
          <p className="text-sm text-card-foreground/70 mb-6">Administrative account details and settings</p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-white/5">
              <h4 className="text-sm font-semibold text-card-foreground/70 mb-2">Account Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-card-foreground/60">Account Created:</span>
                  <span className="text-card-foreground">{formatDate(adminProfileData.accountCreated)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-card-foreground/60">Admin Level:</span>
                  <span className="text-primary font-medium">{adminProfileData.adminLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-card-foreground/60">Profile Status:</span>
                  <span className="text-success font-medium">Active</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-white/5">
              <h4 className="text-sm font-semibold text-card-foreground/70 mb-2">Security Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-card-foreground/60">2FA Status:</span>
                  <span className="text-success font-medium">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-card-foreground/60">Session Timeout:</span>
                  <span className="text-card-foreground">30 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-card-foreground/60">Login Notifications:</span>
                  <span className="text-success font-medium">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <h3 className="text-xl font-bold text-card-foreground mb-2">Recent Administrative Activity</h3>
          <p className="text-sm text-card-foreground/70 mb-6">Your latest administrative actions and system updates</p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Calendar className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-card-foreground">Last login</p>
                <p className="text-xs text-card-foreground/60">{formatDate(adminProfileData.lastLogin)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Settings className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-card-foreground">Updated system configuration</p>
                <p className="text-xs text-card-foreground/60">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Users className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-card-foreground">Created new user account</p>
                <p className="text-xs text-card-foreground/60">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Shield className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-card-foreground">Reviewed security logs</p>
                <p className="text-xs text-card-foreground/60">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
