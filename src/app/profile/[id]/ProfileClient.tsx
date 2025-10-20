'use client';

import { useState } from 'react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckCircle2,
  AlertCircle,
  Edit2,
  Save,
  X,
  ShieldCheck,
  Info,
} from 'lucide-react';

type Props = {
  id: string;
};

export default function ProfileClient({ id }: Props) {
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 123-4567');
  const [tempPhone, setTempPhone] = useState(phoneNumber);

  const handleSavePhone = () => {
    setPhoneNumber(tempPhone);
    setIsEditingPhone(false);
  };

  const handleCancelEdit = () => {
    setTempPhone(phoneNumber);
    setIsEditingPhone(false);
  };

  // Mock data
  const userData = {
    name: 'John Anderson',
    email: 'john.anderson@gmail.com',
    avatar: '/professional-male-avatar.png',
    isVerified: true,
    idExpiration: 'March 15, 2026',
    trustStatus: 'good',
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-balance">
          Profile Settings
        </h1>
        <p className="text-muted-foreground text-pretty">
          Manage your account information and verification status
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Route user id: {id}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Main Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your profile information is synced with your Google account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture and Name Section */}
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <Avatar className="border-border h-24 w-24 border-2">
                <AvatarImage
                  src={userData.avatar || '/placeholder.svg'}
                  alt={userData.name}
                />
                <AvatarFallback className="text-2xl">
                  {userData.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>

              <div className="w-full flex-1 space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Full Name
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Synced from your Google account
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="name"
                    value={userData.name}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    Email Address
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Synced from your Google account
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </div>

                {/* Phone Number Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      value={isEditingPhone ? tempPhone : phoneNumber}
                      onChange={(e) => setTempPhone(e.target.value)}
                      disabled={!isEditingPhone}
                      className={!isEditingPhone ? 'bg-muted' : ''}
                    />
                    {!isEditingPhone ? (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsEditingPhone(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="default"
                          size="icon"
                          onClick={handleSavePhone}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Verification Status
            </CardTitle>
            <CardDescription>
              Your identity verification and account security information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Verification Badge */}
            <div className="bg-card flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                {userData.isVerified ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium">Identity Verification</p>
                  <p className="text-muted-foreground text-sm">
                    {userData.isVerified ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>
              </div>
              <Badge
                variant={userData.isVerified ? 'default' : 'secondary'}
                className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
              >
                {userData.isVerified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>

            {/* ID Expiration */}
            <div className="bg-card flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="text-muted-foreground h-5 w-5 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-pretty">
                          You will need to reverify your identity on{' '}
                          {userData.idExpiration}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div>
                  <p className="font-medium">ID Expiration Date</p>
                  <p className="text-muted-foreground text-sm">
                    Expires on {userData.idExpiration}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Factor Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Trust Factor</CardTitle>
            <CardDescription>
              Your account standing and community reputation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-card flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium">Account Status</p>
                  <p className="text-muted-foreground text-sm">
                    Your account is in good standing
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-green-500/20 bg-green-500/10 text-green-500"
              >
                Good Standing
              </Badge>
            </div>

            <div className="bg-muted/50 mt-4 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">No pending issues</p>
                  <p className="text-muted-foreground text-sm text-pretty">
                    There are no active reports, warnings, or punishments on
                    your account.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google Account Notice */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 text-blue-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Connected to Google Account
                </p>
                <p className="text-muted-foreground text-sm text-pretty">
                  Your name and email are managed through your Google account.
                  To update these details, please visit your Google Account
                  settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
