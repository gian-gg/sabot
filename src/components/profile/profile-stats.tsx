import {
  CheckCircle2,
  TrendingUp,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserProfileStats } from '@/types/profile';

interface ProfileStatsProps {
  stats: UserProfileStats;
}

interface StatCardProps {
  Icon: LucideIcon;
  title: string;
  value: string;
  description: string;
}

function StatCard({ Icon, title, value, description }: StatCardProps) {
  return (
    <Card className="border-border/40 from-card to-card/50 bg-linear-to-br">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium sm:text-sm">
          {title}
        </CardTitle>
        <Icon className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold sm:text-2xl">{value}</div>
        <p className="text-muted-foreground text-[10px] sm:text-xs">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      <StatCard
        Icon={ShoppingBag}
        title="Total Transactions"
        value={stats.totalTransactions.toString()}
        description="All-time transactions"
      />

      <StatCard
        Icon={CheckCircle2}
        title="Completed"
        value={stats.completedTransactions.toString()}
        description="Successfully completed"
      />

      <StatCard
        Icon={TrendingUp}
        title="Success Rate"
        value={`${stats.completionRate || 0}%`}
        description="Completion rate"
      />
    </div>
  );
}
