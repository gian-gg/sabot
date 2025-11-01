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
    <Card className="border-border/40 from-card to-card/50 bg-linear-to-br">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-primary h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-muted-foreground flex items-center text-xs">
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
