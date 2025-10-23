import React from 'react';
import { AlertCircle } from 'lucide-react';

import { formatDate } from '@/lib/utils/helpers';

import type { GovernmentIdInfo } from '@/types/verify';

type UserInfoProps = {
  userData: GovernmentIdInfo | null;
};

const UserInfo = ({ userData }: UserInfoProps) => {
  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold">Extracted Information</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between border-b py-2">
          <span className="text-muted-foreground">Full Name</span>
          <span className="font-medium">
            {userData?.firstName || ''} {userData?.middleName || ''}{' '}
            {userData?.lastName || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="text-muted-foreground">ID Number</span>
          <span className="font-medium">{userData?.idNumber || 'N/A'}</span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="text-muted-foreground">Date of Birth</span>
          <span className="font-medium">
            {formatDate(userData?.dateOfBirth || '')}
          </span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="text-muted-foreground">Sex</span>
          <span className="font-medium">{userData?.sex || 'N/A'}</span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="text-muted-foreground">Issue Date</span>
          <span className="font-medium">
            {formatDate(userData?.issueDate || '')}
          </span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="text-muted-foreground">Expiry Date</span>
          <span className="font-medium">
            {formatDate(userData?.expiryDate || '')}
          </span>
        </div>
        {userData?.address && (
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Address</span>
            <span className="max-w-[60%] text-right font-medium">
              {userData.address}
            </span>
          </div>
        )}
      </div>
      {userData?.notes && (
        <div className="mt-3 rounded-md bg-yellow-50 p-3 dark:bg-yellow-950">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Additional Notes
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {userData.notes}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
