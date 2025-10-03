import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      label: 'Add Transaction',
      icon: Plus,
      variant: 'default' as const,
      color: 'bg-primary text-primary-foreground',
    },
    {
      label: 'Send Money',
      icon: ArrowUpRight,
      variant: 'outline' as const,
      color: '',
    },
    {
      label: 'Request Money',
      icon: ArrowDownRight,
      variant: 'outline' as const,
      color: '',
    },
    {
      label: 'View Reports',
      icon: PieChart,
      variant: 'outline' as const,
      color: '',
    },
  ];

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-bold">Quick Actions</h2>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant={action.variant}
                  className="h-auto flex-col gap-3 py-6"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      action.color || 'bg-secondary'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
