import React from 'react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

import { UserIDType } from '@/types/verify';

const UserID = ({ userID }: { userID: UserIDType | null }) => {
  return (
    <>
      <h3 className="mb-3 text-lg font-semibold">ID Document</h3>
      <div className="mb-2">
        <span className="text-muted-foreground text-sm">Document Type: </span>
        <Badge variant="secondary">{userID?.type}</Badge>
      </div>
      {userID?.file && (
        <div className="bg-background mt-2 flex justify-center rounded-md p-4">
          <Image
            src={
              typeof userID.file === 'string'
                ? userID.file
                : URL.createObjectURL(userID.file)
            }
            alt="ID Document"
            width={400}
            height={250}
            className="h-auto max-w-full rounded-md"
            unoptimized
            priority={false}
          />
        </div>
      )}
    </>
  );
};

export default UserID;
