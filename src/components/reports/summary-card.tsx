// Compact summary card for counts; tone controls the icon bubble styling.
import React from 'react';
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type SummaryTone = 'muted' | 'accent' | 'positive';

export const SummaryCard = React.memo(function SummaryCard({
  title,
  value,
  icon,
  tone = 'muted',
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  tone?: SummaryTone;
}) {
  return (
    <Card className="glass rounded-xl shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="relative">
        <div
          className={cn(
            'absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-md',
            tone === 'positive' && 'bg-primary/15 text-primary',
            tone === 'accent' && 'bg-accent/40 text-foreground/90',
            tone === 'muted' && 'bg-muted/40 text-foreground/80'
          )}
          aria-hidden
        >
          {icon}
        </div>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-bold">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
});
