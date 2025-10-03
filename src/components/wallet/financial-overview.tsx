import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';

export function FinancialOverview() {
  const stats = [
    {
      title: 'Total Balance',
      value: '$24,582.50',
      change: '+12.5%',
      trend: 'up',
      icon: Wallet,
      color: 'text-primary',
    },
    {
      title: 'Monthly Income',
      value: '$8,420.00',
      change: '+8.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      title: 'Monthly Expenses',
      value: '$4,285.30',
      change: '-3.1%',
      trend: 'down',
      icon: TrendingDown,
      color: 'text-accent',
    },
    {
      title: 'Credit Available',
      value: '$15,000.00',
      change: '75% used',
      trend: 'neutral',
      icon: CreditCard,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-bold">Financial Overview</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="transition-shadow hover:shadow-lg"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="mb-1 text-2xl font-bold">{stat.value}</div>
                <p
                  className={`flex items-center gap-1 text-xs ${
                    stat.trend === 'up'
                      ? 'text-success'
                      : stat.trend === 'down'
                        ? 'text-accent'
                        : 'text-muted-foreground'
                  }`}
                >
                  {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                  {stat.trend === 'down' && (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
