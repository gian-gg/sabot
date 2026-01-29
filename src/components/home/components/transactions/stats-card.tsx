import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

const StatsCard = ({
  Icon,
  title,
  value,
  description,
}: {
  Icon: LucideIcon;
  title: string;
  value: string;
  description: string;
}) => {
  return (
    <Card className="border-border/40 from-card to-card/50 gap-0 bg-linear-to-br p-4 md:gap-4 md:p-6">
      <CardHeader className="flex flex-row items-center justify-between p-0">
        <CardTitle className="text-xs font-medium sm:text-sm">
          {title}
        </CardTitle>
        <Icon className="text-primary/50" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-xl font-bold sm:text-2xl">{value}</div>
        <div className="text-muted-foreground flex items-center text-[10px] sm:text-xs">
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
