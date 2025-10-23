import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export type DisclaimerVariant = 'info' | 'success' | 'warning' | 'error';

type IconType = React.ComponentType<{ className?: string }>;

const VARIANT_STYLES: Record<
  DisclaimerVariant,
  { className: string; Icon: IconType }
> = {
  info: {
    className:
      'border-2 border-dashed border-blue-400/30 bg-gradient-to-br from-blue-400/10 to-transparent',
    Icon: Info,
  },
  success: {
    className:
      'border-2 border-dashed border-green-400/30 bg-gradient-to-br from-green-400/10 to-transparent',
    Icon: CheckCircle2,
  },
  warning: {
    className:
      'border-2 border-dashed border-amber-400/30 bg-gradient-to-br from-amber-400/10 to-transparent',
    Icon: AlertTriangle,
  },
  error: {
    className:
      'border-2 border-dashed border-red-400/30 bg-gradient-to-br from-red-400/10 to-transparent',
    Icon: XCircle,
  },
};

export interface DisclaimerProps
  extends Omit<React.ComponentProps<'div'>, 'title'> {
  variant?: DisclaimerVariant;
  title?: React.ReactNode;
  children?: React.ReactNode;
  icon?: IconType;
}

export function Disclaimer({
  variant = 'info',
  title,
  children,
  className,
  icon: IconOverride,
  ...rest
}: DisclaimerProps) {
  const { className: variantClasses, Icon } = VARIANT_STYLES[variant];
  const IconToRender = IconOverride ?? Icon;

  return (
    <Alert className={cn('p-4', variantClasses, className)} {...rest}>
      <IconToRender className="h-4 w-4 flex-shrink-0" />
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {children ? <AlertDescription>{children}</AlertDescription> : null}
    </Alert>
  );
}

export default Disclaimer;
