'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, MapPin, Camera, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileEditModal from '@/components/profile/ProfileEditModal';

export default function ProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
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
  });

  const handleSaveProfile = (data: typeof profileData) => {
    setProfileData(data);
    setIsModalOpen(false);
  };

  const fullName = `${profileData.name} ${profileData.middleName ? profileData.middleName + ' ' : ''}${profileData.lastName}`;
  const fullPhone = profileData.phoneNumber ? `${profileData.phoneCountryCode} ${profileData.phoneNumber}` : '';
  
  const addressParts = [];
  if (profileData.aptSuite) addressParts.push(profileData.aptSuite);
  if (profileData.streetAddress1) addressParts.push(profileData.streetAddress1);
  const streetLine = addressParts.join(', ');
  const cityLine = `${profileData.city}, ${profileData.region} ${profileData.postalCode}`;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Avatar, Display Name, Username, Edit Button */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div 
                className="relative w-24 h-24 rounded-full bg-muted border-4 border-primary flex items-center justify-center overflow-hidden mb-4 cursor-pointer group hover:bg-accent transition-all"
                onClick={() => {/* TODO: Add avatar upload functionality */}}
              >
                <User className="w-12 h-12 text-primary" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-1">{profileData.displayName}</h2>
              <p className="text-sm text-muted-foreground mb-4">@{profileData.username}</p>
              <Button 
                size="sm"
                className="w-auto"
                onClick={() => setIsModalOpen(true)}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: User Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{fullName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div>
                  <span className="font-medium">{profileData.jobTitle}</span>
                </div>
              </div>
              
              {profileData.company && (
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{profileData.company}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">{profileData.email}</span>
              </div>
              
              {fullPhone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{fullPhone}</span>
                </div>
              )}
              
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                <div className="text-muted-foreground">
                  {streetLine && <div>{streetLine}</div>}
                  <div>{cityLine}</div>
                  <div>{profileData.country}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card 3: About Me */}
        {profileData.bio && (
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profileData.bio}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Profile Statistics</CardTitle>
            <CardDescription>Your activity and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold">---</div>
                <div className="text-sm text-muted-foreground">Activities</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold">---</div>
                <div className="text-sm text-muted-foreground">Achievements</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold">---</div>
                <div className="text-sm text-muted-foreground">Contributions</div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Skills</h3>
              <p className="text-sm text-muted-foreground">No skills added</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No recent activity to display</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfileEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileData={profileData}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
