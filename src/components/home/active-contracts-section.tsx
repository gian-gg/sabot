import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText } from 'lucide-react';

const contracts = [
  {
    id: 'CT-2024-001',
    party: 'Acme Corporation',
    value: '$125,000',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
  },
  {
    id: 'CT-2024-002',
    party: 'TechStart Inc',
    value: '$89,500',
    status: 'active',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
  },
  {
    id: 'CT-2024-003',
    party: 'Global Ventures',
    value: '$250,000',
    status: 'pending',
    startDate: '2024-03-10',
    endDate: '2024-09-10',
  },
  {
    id: 'CT-2024-004',
    party: 'Digital Solutions Ltd',
    value: '$67,800',
    status: 'active',
    startDate: '2024-01-20',
    endDate: '2024-07-20',
  },
];

export function ActiveContractsSection() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Active Contracts</CardTitle>
        <CardDescription className="text-muted-foreground">
          View and manage your secured transaction contracts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border border-b">
                <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                  Contract ID
                </th>
                <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                  Party
                </th>
                <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                  Value
                </th>
                <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                  Status
                </th>
                <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                  Period
                </th>
                <th className="text-muted-foreground pb-3 text-right text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr
                  key={contract.id}
                  className="border-border border-b last:border-0"
                >
                  <td className="text-foreground py-4 font-mono text-sm">
                    {contract.id}
                  </td>
                  <td className="text-foreground py-4 text-sm">
                    {contract.party}
                  </td>
                  <td className="text-foreground py-4 text-sm font-semibold">
                    {contract.value}
                  </td>
                  <td className="py-4">
                    <Badge
                      variant={
                        contract.status === 'active' ? 'default' : 'secondary'
                      }
                      className={
                        contract.status === 'active'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-secondary text-secondary-foreground'
                      }
                    >
                      {contract.status}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground py-4 text-sm">
                    {contract.startDate} - {contract.endDate}
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <FileText className="mr-1 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="mr-1 h-4 w-4" />
                        Ledger
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
