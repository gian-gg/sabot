'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Download, Trash2 } from 'lucide-react';

export function DangerZone() {
  return (
    <Card className="border-red-900/50 bg-red-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
        </div>
        <CardDescription className="text-neutral-400">
          Irreversible actions for your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <Label className="text-neutral-300">Export Account Data</Label>
            <p className="text-sm text-neutral-500">
              Download all your data in JSON format
            </p>
          </div>
          <Button variant="outline" disabled className="border-neutral-700">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        <Separator className="bg-neutral-800" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <Label className="text-red-500">Delete Account</Label>
            <p className="text-sm text-neutral-500">
              Permanently delete your account and all associated data
            </p>
          </div>
          <Button
            variant="destructive"
            disabled
            className="bg-red-900 hover:bg-red-800"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
