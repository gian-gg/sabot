interface ProfileAlertProps {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

const alertStyles = {
  error: {
    border: 'border-red-500/20',
    bg: 'bg-red-500/10',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-500',
    titleColor: 'text-red-500',
  },
  warning: {
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/10',
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-500',
  },
  info: {
    border: 'border-border',
    bg: 'bg-muted/20',
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    titleColor: '',
  },
};

const alertIcons = {
  error: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  ),
  warning: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  ),
  info: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
};

export function ProfileAlert({ type, title, message }: ProfileAlertProps) {
  const styles = alertStyles[type];

  return (
    <div
      className={`rounded-lg border ${styles.border} ${styles.bg} p-4 sm:p-6`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}
        >
          <svg
            className={`h-3 w-3 ${styles.iconColor}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {alertIcons[type]}
          </svg>
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${styles.titleColor}`}>{title}</h3>
          <p className="text-muted-foreground mt-1 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}

export function ProfileNotFound() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="max-w-md rounded-lg border border-red-500/20 bg-red-500/10 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-red-500">
              User Not Found
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              The user profile you&apos;re looking for doesn&apos;t exist or has
              no transactons yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
