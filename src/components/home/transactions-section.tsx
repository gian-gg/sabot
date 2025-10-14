'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Sparkles } from 'lucide-react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const transactionData = [
  { month: 'Jan', transactions: 245 },
  { month: 'Feb', transactions: 312 },
  { month: 'Mar', transactions: 289 },
  { month: 'Apr', transactions: 401 },
  { month: 'May', transactions: 478 },
  { month: 'Jun', transactions: 523 },
];

export function TransactionsSection() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transaction Graph */}
        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">
                  Transaction Volume
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Monthly transaction count
                </CardDescription>
              </div>
              <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <TrendingUp className="text-primary h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-foreground text-3xl font-bold">523</div>
              <p className="text-muted-foreground text-sm">
                +9.4% from last month
              </p>
            </div>
            <ChartContainer
              config={{
                transactions: {
                  label: 'Transactions',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transactionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="var(--color-transactions)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-transactions)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Box */}
        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Total Revenue</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Protected transaction value
                </CardDescription>
              </div>
              <div className="bg-accent/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <DollarSign className="text-accent h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-foreground text-3xl font-bold">$2.4M</div>
              <p className="text-muted-foreground text-sm">
                +12.3% from last month
              </p>
            </div>
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="bg-secondary text-secondary-foreground w-full justify-start"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI Summary
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                Data Insights
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions Box */}
      <Card className="from-primary/10 via-card to-accent/10 bg-gradient-to-br">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            <CardTitle className="text-foreground">
              AI Security Suggestions
            </CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            AI-generated recommendations to improve transaction security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-card rounded-lg p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-foreground text-sm font-medium">
                Security Improvements Generated
              </span>
              <span className="text-primary text-2xl font-bold">847</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Lines of code generated to enhance fraud detection and secure
              payment processing
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="secondary"
              className="bg-secondary text-secondary-foreground"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Summary
            </Button>
            <Button variant="outline">AI Insights</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
