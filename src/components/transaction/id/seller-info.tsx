import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerificationBadge } from '@/components/user/verification-badge';
import { ROUTES } from '@/constants/routes';

type SellerInfoProps = {
  seller: {
    id: string;
    name: string;
    isVerified: boolean;
  } | null;
  transaction: {
    sellerName: string;
    currency: string;
    price: number;
  };
};

export function SellerInfoCard({ seller, transaction }: SellerInfoProps) {
  return (
    <>
      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 font-semibold text-white">
              {(seller?.name || transaction.sellerName).charAt(0)}
            </div>
            <div className="flex-1">
              <Link
                href={ROUTES.USER.VIEW(seller?.id || 'user-2')}
                className="text-base font-semibold text-white hover:underline"
              >
                {seller?.name || transaction.sellerName}
              </Link>
              {seller && (
                <div className="mt-1">
                  <VerificationBadge isVerified={seller.isVerified} size="sm" />
                </div>
              )}
              <p className="mt-1 text-xs text-neutral-500">
                Verified on platform since Jan 2023
              </p>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-2">
            <p className="mb-2 text-xs text-neutral-500">Their Offer</p>
            <div className="rounded-lg border border-neutral-800/50 bg-black/40 p-3">
              <p className="text-sm text-white">
                {transaction.currency}
                {transaction.price.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Firm price, includes original box and accessories
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Completed deals</span>
              <span className="font-medium text-white">47</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Success rate</span>
              <span className="font-medium text-emerald-400">98.5%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Avg response time</span>
              <span className="font-medium text-white">2.3 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
