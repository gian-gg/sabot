'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/store/user/userStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BackButton } from '@/components/core/back-button';
import { ROUTES } from '@/constants/routes';
import {
  User,
  Mail,
  Shield,
  Crown,
  Calendar,
  Activity,
  Star,
  Edit2,
  Save,
  X,
  Camera,
  Phone,
  UserCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { getInitials } from '@/lib/utils/helpers';
import Disclaimer from '@/components/ui/disclaimer';
import Link from 'next/link';

const MOCK_USER_DATA = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  bio: 'Experienced buyer with a passion for secure online transactions.',
  emergencyContactName: 'Jane Doe',
  emergencyContactPhone: '+1 (555) 987-6543',
  emergencyContactRelationship: 'Spouse',
  MORE_INFO: {
    joinDate: 'January 2024',
    transactionCount: 12,
    rating: 4.8,
    trustScore: 95,
  },
};

export default function ProfilePage() {
  const user = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable form state (mock data for now)
  const [formData, setFormData] = useState({
    name: user.name || MOCK_USER_DATA.name,
    email: user.email || MOCK_USER_DATA.email,
    phone: MOCK_USER_DATA.phone,
    bio: MOCK_USER_DATA.bio,
    emergencyContactName: MOCK_USER_DATA.emergencyContactName,
    emergencyContactPhone: MOCK_USER_DATA.emergencyContactPhone,
    emergencyContactRelationship: MOCK_USER_DATA.emergencyContactRelationship,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update user store with name and email
    user.setName(formData.name);
    user.setEmail(formData.email);

    setIsSaving(false);
    setIsEditing(false);
    toast.info('Saving feature coming soon');
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: user.name || 'John Doe',
      email: user.email || 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      bio: 'Experienced buyer with a passion for secure online transactions.',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+1 (555) 987-6543',
      emergencyContactRelationship: 'Spouse',
    });
    setIsEditing(false);
  };

  const getVerificationBadge = () => {
    switch (user.verificationStatus) {
      case 'complete':
        return (
          <Badge className="gap-1.5">
            <Shield className="size-3" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1.5">
            <Activity className="size-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1.5">
            <AlertCircle className="size-3" />
            Not Verified
          </Badge>
        );
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <BackButton fallbackUrl={ROUTES.HOME.ROOT} />
        <h1 className="text-4xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground text-base">
          Manage your account information and preferences
        </p>
      </div>

      {/* Prototype Disclaimer */}

      <Disclaimer variant="info" title="Prototype disclaimer">
        Some features might not work as intended because this project is a
        prototype. Expect changes and occasional glitches.
      </Disclaimer>

      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="border-primary/20 size-20 border-2">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {getInitials(user.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                {!isEditing && (
                  <button
                    className="bg-card hover:bg-accent border-primary/20 absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 transition-colors"
                    onClick={() =>
                      toast.info('Upload photo feature coming soon')
                    }
                  >
                    <Camera className="size-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">{user.name}</h2>
                  {user.role === 'admin' && (
                    <Badge variant="secondary" className="gap-1.5">
                      <Crown className="size-3" />
                      Admin
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getVerificationBadge()}
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Star className="fill-primary text-primary size-3.5" />
                    <span className="font-medium">
                      {MOCK_USER_DATA.MORE_INFO.rating}
                    </span>
                    <span>
                      ({MOCK_USER_DATA.MORE_INFO.transactionCount} transactions)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="size-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="size-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="size-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your basic account details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : (
                  <p className="text-foreground text-sm font-medium">
                    {formData.name}
                  </p>
                )}
              </div>

              <Separator />

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="size-4" />
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <p className="text-foreground text-sm font-medium">
                    {formData.email}
                  </p>
                )}
              </div>

              <Separator />

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="size-4" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <p className="text-foreground text-sm font-medium">
                    {formData.phone}
                  </p>
                )}
              </div>

              <Separator />

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="border-input dark:bg-input/30 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {formData.bio}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="size-5" />
                Emergency Contact
              </CardTitle>
              <CardDescription>
                Someone we can reach in case of account issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Emergency Contact Name */}
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Contact Name</Label>
                {isEditing ? (
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContactName}
                    onChange={(e) =>
                      handleInputChange('emergencyContactName', e.target.value)
                    }
                  />
                ) : (
                  <p className="text-foreground text-sm font-medium">
                    {formData.emergencyContactName}
                  </p>
                )}
              </div>

              <Separator />

              {/* Emergency Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Contact Phone</Label>
                {isEditing ? (
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) =>
                      handleInputChange('emergencyContactPhone', e.target.value)
                    }
                  />
                ) : (
                  <p className="text-foreground text-sm font-medium">
                    {formData.emergencyContactPhone}
                  </p>
                )}
              </div>

              <Separator />

              {/* Relationship */}
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                {isEditing ? (
                  <Input
                    id="relationship"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) =>
                      handleInputChange(
                        'emergencyContactRelationship',
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <p className="text-foreground text-sm font-medium">
                    {formData.emergencyContactRelationship}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Account Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                Account Statistics
              </CardTitle>
              <CardDescription>
                Your activity and reputation overview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Member Since */}
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Calendar className="size-4" />
                  <span>Member Since</span>
                </div>
                <span className="text-foreground text-sm font-medium">
                  {MOCK_USER_DATA.MORE_INFO.joinDate}
                </span>
              </div>

              <Separator />

              {/* Total Transactions */}
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Activity className="size-4" />
                  <span>Total Transactions</span>
                </div>
                <span className="text-foreground text-sm font-medium">
                  {MOCK_USER_DATA.MORE_INFO.transactionCount}
                </span>
              </div>

              <Separator />

              {/* Rating */}
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Star className="size-4" />
                  <span>Average Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="fill-primary text-primary size-4" />
                  <span className="text-foreground text-sm font-medium">
                    {MOCK_USER_DATA.MORE_INFO.rating}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Trust Score */}
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Shield className="size-4" />
                  <span>Trust Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-secondary h-2 w-24 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{
                        width: `${MOCK_USER_DATA.MORE_INFO.trustScore}%`,
                      }}
                    />
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    {MOCK_USER_DATA.MORE_INFO.trustScore}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Verification Status
              </CardTitle>
              <CardDescription>
                Your identity verification and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Identity Verification
                </span>
                {getVerificationBadge()}
              </div>

              {user.verificationStatus === 'complete' && (
                <>
                  <Separator />
                  <div className="from-primary/10 to-accent/10 rounded-lg bg-linear-to-br p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/20 flex size-10 shrink-0 items-center justify-center rounded-full">
                        <Shield className="text-primary size-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-foreground text-sm font-medium">
                          Identity Verified
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Your identity has been verified and your account is
                          fully secured. You have access to all platform
                          features.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {user.verificationStatus === 'pending' && (
                <>
                  <Separator />
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-secondary flex size-10 shrink-0 items-center justify-center rounded-full">
                        <Activity className="text-muted-foreground size-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-foreground text-sm font-medium">
                          Verification Pending
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Your verification request is being reviewed. This
                          typically takes 24-48 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {user.verificationStatus === 'not-started' && (
                <>
                  <Separator />
                  <div className="border-primary/30 rounded-lg border-2 border-dashed p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-full">
                        <AlertCircle className="text-primary size-5" />
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-foreground text-sm font-medium">
                            Complete Verification
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Verify your identity to unlock full access and build
                            trust with other users.
                          </p>
                        </div>
                        <Button size="sm" className="w-full" asChild>
                          <Link href={ROUTES.HOME.VERIFY}>
                            Start Verification
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Account Role Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="size-5" />
                Account Role
              </CardTitle>
              <CardDescription>
                Your account permissions and access level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Current Role
                </span>
                {user.role === 'admin' ? (
                  <Badge variant="secondary" className="gap-1.5">
                    <Crown className="size-3" />
                    Administrator
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1.5">
                    <User className="size-3" />
                    User
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
