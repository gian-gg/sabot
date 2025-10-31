import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
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

const PieChartComponent = ({
  statusDistributionData,
}: {
  statusDistributionData: {
    name: string;
    value: number;
    color: string;
  }[];
}) => {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
        <CardDescription>Breakdown by transaction status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <RechartsPieChart>
            <Pie
              data={statusDistributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </RechartsPieChart>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {statusDistributionData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="flex-1 text-sm">{item.name}</span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChartComponent;
