import React from 'react';

import { formatDate } from '@/lib/utils/helpers';

import type { GovernmentIdInfo } from '@/types/verify';
import { Disclaimer } from '@/components/ui/disclaimer';

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
        <Disclaimer
          variant="success"
          className="mb-4"
          title=" Additional Notes"
        >
          {userData.notes}
        </Disclaimer>
      )}
    </div>
  );
};

export default UserInfo;
