import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Ease out quartic
      const easeOut = 1 - Math.pow(1 - percentage, 4);

      setCount(end * easeOut);

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return count;
}

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
  const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
  const isCurrency = value.includes('$');
  const isPercentage = value.includes('%');
  const count = useCountUp(isNaN(numericValue) ? 0 : numericValue);

  const formattedValue = React.useMemo(() => {
    if (isNaN(numericValue)) return value;

    if (isPercentage) {
      return `${count.toFixed(1)}%`;
    }

    // For currency and regular numbers, we stick to standard locale string
    // We floor it for volume/simple numbers to avoid erratic decimals during animation
    const formattedNumber = Math.floor(count).toLocaleString();

    if (isCurrency) {
      return `$${formattedNumber}`;
    }

    return formattedNumber;
  }, [count, isCurrency, isPercentage, numericValue, value]);

  return (
    <Card className="border-border/40 from-card to-card/50 gap-0 bg-linear-to-br p-4 md:gap-4 md:p-6">
      <CardHeader className="flex flex-row items-center justify-between p-0">
        <CardTitle className="text-xs font-medium sm:text-sm">
          {title}
        </CardTitle>
        <Icon className="text-primary/50" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-xl font-bold sm:text-2xl">{formattedValue}</div>
        <div className="text-muted-foreground flex items-center text-[10px] sm:text-xs">
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
