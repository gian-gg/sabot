'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface TransactionLinkProps {
  link: string;
  onCopy?: () => Promise<void> | void;
  copied?: boolean;
  onOpenDialog?: () => void;
}

export default function TransactionLinkSection({
  link,
  onCopy,
  copied,
  onOpenDialog,
}: TransactionLinkProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Transaction Link</CardTitle>
        <CardDescription>Share or open the transaction link</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="truncate text-sm">{link}</span>
            <div className="ml-4 flex gap-2">
              <button
                type="button"
                onClick={onCopy}
                className="bg-primary rounded px-3 py-1 text-sm text-white hover:opacity-90"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={onOpenDialog}
                className="rounded border px-3 py-1 text-sm"
              >
                Open
              </button>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            Anyone with this link can view the transaction.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
