import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Info, Package, MapPin } from 'lucide-react';

// --- Product Info Types ---
type ProductInfoTransaction = {
  currency: string;
  price: number;
  id: string;
  method: string;
  // add other fields if needed
};

// --- Product Details Static Data ---
const productDetails = {
  type: 'Smartphone',
  model: 'iPhone 14 Pro Max',
  condition: 'Like New',
  specs: {
    storage: '256GB',
    color: 'Deep Purple',
    battery: '98% health',
    warranty: 'AppleCare+ until Dec 2024',
  },
};

// --- Product Info Card ---
export function ProductInfoCard({
  transaction,
}: {
  transaction: ProductInfoTransaction;
}) {
  const [specsOpen, setSpecsOpen] = useState(false);
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Package className="h-4 w-4" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-neutral-500">Type</p>
              <p className="text-sm font-medium text-white">
                {productDetails.type}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Model</p>
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-white">
                  {productDetails.model}
                </p>
                <Dialog open={specsOpen} onOpenChange={setSpecsOpen}>
                  <DialogTrigger asChild>
                    <button className="text-blue-400 hover:text-blue-300">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="border-neutral-800 bg-neutral-900">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        Product Specifications
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                      {Object.entries(productDetails.specs).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between border-b border-neutral-800 py-2"
                          >
                            <span className="text-sm text-neutral-400 capitalize">
                              {key}
                            </span>
                            <span className="text-sm font-medium text-white">
                              {value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Condition</p>
              <Badge
                variant="secondary"
                className="mt-1 border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
              >
                {productDetails.condition}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Price</p>
              <p className="text-sm font-medium text-white">
                {transaction.currency}
                {transaction.price.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
    </>
  );
}
