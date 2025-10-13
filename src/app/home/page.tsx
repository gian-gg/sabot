import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function Page() {
  return (
    <div className="flex min-h-screen flex-1 flex-col gap-4 p-4 pt-14">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Home</h1>
        <Button asChild>
          <Link href={ROUTES.TRANSACTION.NEW}>
            <Plus className="mr-2 h-4 w-4" />
            Create Transaction
          </Link>
        </Button>
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </div>
  );
}
