import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

type TransactionDetailsProps = {
  transaction: {
    id: string;
    method: string;
    // add other fields if needed
  };
};

export function TransactionDetailsCard({
  transaction,
}: TransactionDetailsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-white">
          Transaction Details
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-neutral-400" />
          <div>
            <p className="text-sm font-medium text-white">
              {transaction.method === 'meetup'
                ? 'In-Person Meetup'
                : 'Online Transaction'}
            </p>
            <p className="text-xs text-neutral-500">
              {transaction.method === 'meetup'
                ? 'Face-to-face exchange at agreed location'
                : 'Digital payment and shipping'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-neutral-400" />
          <div>
            <p className="text-sm font-medium text-white">{transaction.id}</p>
            <p className="text-xs text-neutral-500">Transaction ID</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
