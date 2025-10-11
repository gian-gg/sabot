'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/common/page-header';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EmergencyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to database
    setSaved(true);
    setTimeout(() => {
      router.push(ROUTES.HOME.ROOT);
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black">
      <PageHeader />

      <div className="flex flex-1 items-center justify-center overflow-y-auto p-8">
        <Card className="w-full max-w-md border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
          <CardHeader>
            <CardTitle className="text-white">Emergency Contact</CardTitle>
            <CardDescription className="text-neutral-400">
              Set up a trusted contact who will be notified in case of emergency
              during transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {saved ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-400" />
                <p className="text-lg font-medium text-white">
                  Emergency Contact Saved!
                </p>
                <p className="text-sm text-neutral-400">
                  Redirecting you back...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-neutral-200">
                    Contact Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="border-neutral-700 bg-black/40 text-white"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-neutral-200">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="border-neutral-700 bg-black/40 text-white"
                    placeholder="+63 912 345 6789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship" className="text-neutral-200">
                    Relationship
                  </Label>
                  <Input
                    id="relationship"
                    name="relationship"
                    type="text"
                    value={formData.relationship}
                    onChange={handleChange}
                    required
                    className="border-neutral-700 bg-black/40 text-white"
                    placeholder="Family, Friend, etc."
                  />
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                  <p className="text-xs text-blue-300">
                    This contact will only be notified if you trigger an
                    emergency alert during an active transaction.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-neutral-700 text-neutral-300 hover:bg-white/5"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-white text-black hover:bg-neutral-200"
                  >
                    Save Contact
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
