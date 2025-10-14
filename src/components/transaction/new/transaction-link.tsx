import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Check, Mail } from 'lucide-react';

export default function TransactionLinkSection({
  link,
  onCopy,
  copied,
  onOpenDialog,
}: {
  link: string;
  onCopy: () => void;
  copied: boolean;
  onOpenDialog: () => void;
}) {
  return (
    <div className="border-border bg-muted/50 rounded-lg border p-4">
      <h3 className="mb-2 font-semibold">Your Transaction Link</h3>
      <p className="text-muted-foreground mb-3 text-sm">
        Share this link with your counterparty on any platform (Facebook
        Marketplace, Carousell, etc.)
      </p>
      <div className="flex gap-2">
        <Input readOnly value={link} className="font-mono text-sm" />
        <Button
          variant="outline"
          size="icon"
          onClick={onCopy}
          aria-label="Copy transaction link"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button variant="outline" size="icon" onClick={onOpenDialog}>
          <Mail className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
