import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Plus } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import Link from 'next/link';

export function HeroSection() {
  const user = useUserStore();
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left side - Description and CTA */}
      <div className="flex flex-col justify-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-foreground text-4xl leading-tight font-bold text-balance lg:text-5xl">
            Hello,{' '}
            <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
              {user.name}
            </span>
          </h1>
          <p className="text-muted-foreground w-lg text-base leading-relaxed text-pretty">
            Sabot provides third-party security verification for online
            transactions, leveraging advanced AI to detect fraud, monitor
            suspicious activity, and ensure every transaction is protected with
            enterprise-grade security protocols.
          </p>
        </div>
        <div>
          <Button asChild>
            <Link href={ROUTES.TRANSACTION.NEW}>
              <Plus className="mr-2 h-4 w-4" />
              Create Transaction
            </Link>
          </Button>
        </div>
      </div>

      {/* Right side - Video placeholder */}
      <Card className="bg-secondary/50 relative flex items-center justify-center overflow-hidden p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-primary/20 flex h-20 w-20 items-center justify-center rounded-full backdrop-blur-sm">
            <Play className="fill-primary text-primary h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-foreground text-xl font-semibold">
              Getting Started Tutorial
            </h3>
            <p className="text-muted-foreground text-sm">
              Learn how to secure your first transaction
            </p>
          </div>
        </div>
        <div className="from-primary/10 to-accent/10 absolute inset-0 bg-gradient-to-br via-transparent" />
      </Card>
    </div>
  );
}
