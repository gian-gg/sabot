import React from 'react';
import { BarChart } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  volume: {
    label: 'Volume',
    color: '#01d06c',
  },
  value: {
    label: 'Value ($)',
    color: '#3b82f6',
  },
};

const AreaChartComponent = ({
  transactionVolumeData,
}: {
  transactionVolumeData: { month: string; volume: number; value: number }[];
}) => {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Transaction Volume</CardTitle>
        <CardDescription>
          Monthly transaction count and total value
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {transactionVolumeData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={transactionVolumeData}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#01d06c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#01d06c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#01d06c"
                fill="url(#colorVolume)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] w-full flex-col items-center justify-center text-center">
            <BarChart className="text-muted-foreground/20 mb-3 h-12 w-12" />
            <p className="text-muted-foreground text-sm font-medium">
              No data available
            </p>
            <p className="text-muted-foreground/60 text-xs">
              Transactions will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AreaChartComponent;
