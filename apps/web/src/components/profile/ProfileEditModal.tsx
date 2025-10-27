'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfileData {
  name: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  username: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  aptSuite: string;
  streetAddress1: string;
  streetAddress2: string;
  country: string;
  postalCode: string;
  region: string;
  city: string;
  jobTitle: string;
  company: string;
  bio: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onSave: (data: ProfileData) => void;
}

export default function ProfileEditModal({ 
  isOpen, 
  onClose, 
  profileData,
  onSave 
}: ProfileEditModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedData = { ...profileData };
    
    // Update all fields from form
    Object.keys(profileData).forEach(key => {
      const value = formData.get(key);
      if (value !== null) {
        (updatedData as any)[key] = value.toString();
      }
    });
    
    onSave(updatedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">First Name</Label>
              <Input id="name" name="name" defaultValue={profileData.name} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input id="middleName" name="middleName" defaultValue={profileData.middleName} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" defaultValue={profileData.lastName} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={profileData.email} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneCountryCode">Phone Country Code</Label>
              <Input id="phoneCountryCode" name="phoneCountryCode" defaultValue={profileData.phoneCountryCode} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" defaultValue={profileData.phoneNumber} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" name="jobTitle" defaultValue={profileData.jobTitle} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" defaultValue={profileData.company} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="streetAddress1">Street Address</Label>
              <Input id="streetAddress1" name="streetAddress1" defaultValue={profileData.streetAddress1} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="aptSuite">Apartment/Suite</Label>
              <Input id="aptSuite" name="aptSuite" defaultValue={profileData.aptSuite} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={profileData.city} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">State/Region</Label>
              <Input id="region" name="region" defaultValue={profileData.region} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" name="postalCode" defaultValue={profileData.postalCode} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue={profileData.country} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              name="bio" 
              defaultValue={profileData.bio} 
              rows={4}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}