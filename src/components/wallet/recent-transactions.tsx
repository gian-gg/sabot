import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Coffee, Home, Zap, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RecentTransactions() {
  const transactions = [
    {
      id: 1,
      name: 'Grocery Store',
      category: 'Shopping',
      amount: -125.5,
      date: 'Today, 2:30 PM',
      icon: ShoppingBag,
      color: 'bg-chart-1/10 text-chart-1',
    },
    {
      id: 2,
      name: 'Coffee Shop',
      category: 'Food & Drink',
      amount: -8.5,
      date: 'Today, 9:15 AM',
      icon: Coffee,
      color: 'bg-chart-2/10 text-chart-2',
    },
    {
      id: 3,
      name: 'Rent Payment',
      category: 'Housing',
      amount: -1850.0,
      date: 'Yesterday',
      icon: Home,
      color: 'bg-chart-3/10 text-chart-3',
    },
    {
      id: 4,
      name: 'Electricity Bill',
      category: 'Utilities',
      amount: -95.2,
      date: '2 days ago',
      icon: Zap,
      color: 'bg-chart-4/10 text-chart-4',
    },
    {
      id: 5,
      name: 'Freelance Payment',
      category: 'Income',
      amount: 2500.0,
      date: '3 days ago',
      icon: ShoppingBag,
      color: 'bg-success/10 text-success',
    },
  ];

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Transactions</h2>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Latest Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const Icon = transaction.icon;
              return (
                <div
                  key={transaction.id}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${transaction.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {transaction.category}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {transaction.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${transaction.amount > 0 ? 'text-success' : 'text-foreground'}`}
                    >
                      {transaction.amount > 0 ? '+' : ''}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
