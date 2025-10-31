import React from 'react';
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
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Transaction Volume</CardTitle>
        <CardDescription>
          Monthly transaction count and total value
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[300px]">
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
      </CardContent>
    </Card>
  );
};

export default AreaChartComponent;
