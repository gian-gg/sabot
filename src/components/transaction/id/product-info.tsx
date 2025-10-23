import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Package, MapPin, Hash, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const [copied, setCopied] = useState(false);

  const copyTransactionId = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id);
      setCopied(true);
      toast.success('Transaction ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Log the error for debugging and keep the user-facing toast
      console.error('Failed to copy transaction ID:', err);
      toast.error('Failed to copy transaction ID');
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-white">
          <Package className="h-4 w-4" />
          Product & Transaction Details
        </CardTitle>
        <CardDescription>
          Complete information about the product and transaction details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Product Information Section */}
        <div className="space-y-4">
          <Card
            className={cn(
              'focus-visible:ring-primary border-muted-foreground/20 hover:border-primary relative mb-4 cursor-pointer rounded-lg border-2 border-dashed p-8 transition-colors outline-none focus-visible:ring-2'
            )}
          >
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium tracking-wider text-neutral-400 uppercase">
                    Type
                  </p>
                  <p className="text-base leading-relaxed font-semibold text-white">
                    {productDetails.type}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium tracking-wider text-neutral-400 uppercase">
                    Model
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-base leading-relaxed font-semibold text-white">
                      {productDetails.model}
                    </p>
                    <Dialog open={specsOpen} onOpenChange={setSpecsOpen}>
                      <DialogTrigger asChild>
                        <button className="rounded p-1 text-blue-400 transition-colors hover:bg-blue-400/10 hover:text-blue-300">
                          <Info className="h-4 w-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="border-neutral-800 bg-neutral-900">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            Product Specifications
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {Object.entries(productDetails.specs).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex items-center justify-between border-b border-neutral-800 py-3"
                              >
                                <span className="text-sm font-medium text-neutral-400 capitalize">
                                  {key}
                                </span>
                                <span className="text-sm font-semibold text-white">
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
                <div className="space-y-2">
                  <p className="text-xs font-medium tracking-wider text-neutral-400 uppercase">
                    Condition
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-1 border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-400"
                  >
                    {productDetails.condition}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium tracking-wider text-neutral-400 uppercase">
                    Price
                  </p>
                  <p className="text-lg leading-relaxed font-bold text-white">
                    {transaction.currency}
                    {transaction.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Details Section */}
        <div className="space-y-4">
          {/* Transaction Method */}
          <div className="flex items-start gap-4 rounded-lg border border-neutral-700/50 bg-neutral-900/30 p-4">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-400" />
            <div className="space-y-1">
              <p className="text-base leading-relaxed font-semibold text-white">
                {transaction.method === 'meetup'
                  ? 'In-Person Meetup'
                  : 'Online Transaction'}
              </p>
              <p className="text-sm leading-relaxed text-neutral-400">
                {transaction.method === 'meetup'
                  ? 'Face-to-face exchange at agreed location'
                  : 'Digital payment and shipping'}
              </p>
            </div>
          </div>

          {/* Transaction ID - Special Highlighted Container */}
          <Alert className="border-blue-500/30 bg-blue-500/5">
            <Hash className="h-4 w-4 text-blue-400" />
            <AlertDescription className="space-y-3">
              <p className="text-xs font-medium tracking-wider text-blue-400 uppercase">
                Transaction ID
              </p>
              <div className="flex items-center gap-3">
                <p className="flex-1 font-mono text-lg leading-relaxed font-bold text-white">
                  {transaction.id}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyTransactionId}
                  className="h-8 border-blue-500/30 bg-blue-500/10 px-3 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span className="ml-1.5 text-xs">
                    {copied ? 'Copied' : 'Copy'}
                  </span>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
