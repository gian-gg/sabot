import { Calendar, Clock, FileType, Activity } from 'lucide-react';

const details = [
  {
    label: 'Agreement Type',
    value: 'Partnership Agreement',
    icon: FileType,
  },
  {
    label: 'Status',
    value: 'Draft',
    icon: Activity,
  },
  {
    label: 'Created',
    value: 'January 15, 2025',
    icon: Calendar,
  },
  {
    label: 'Last Updated',
    value: '2 hours ago',
    icon: Clock,
  },
  {
    label: 'Duration',
    value: '12 months',
    icon: Calendar,
  },
  {
    label: 'Auto-renewal',
    value: 'Enabled',
    icon: Activity,
  },
];

export function AgreementDetails() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Agreement Details</h2>
        <p className="text-muted-foreground">
          Key metadata and information about this agreement
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {details.map((detail) => {
          const Icon = detail.icon;
          return (
            <div
              key={detail.label}
              className="border-border bg-card/50 rounded-lg border-2 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Icon className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">
                    {detail.label}
                  </p>
                  <p className="font-semibold">{detail.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
