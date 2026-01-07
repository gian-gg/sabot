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
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import type { AgreementWithParticipants } from '@/types/agreement';

interface ActiveContractsSectionProps {
  agreements: AgreementWithParticipants[];
}

export function ActiveContractsSection({
  agreements,
}: ActiveContractsSectionProps) {
  const router = useRouter();

  // Filter for finalized agreements (these are the "active contracts")
  const activeContracts = agreements.filter(
    (agreement) => agreement.status === 'finalized'
  );

  const handleViewContract = (agreementId: string) => {
    router.push(ROUTES.AGREEMENT.VIEW(agreementId));
  };

  const handleViewLedger = (agreementId: string) => {
    // TODO: Implement blockchain ledger view
    console.log('View ledger for agreement:', agreementId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getOtherPartyName = (agreement: AgreementWithParticipants) => {
    // Find the participant who is not the creator
    const otherParty = agreement.participants.find((p) => p.role === 'invitee');
    return otherParty?.name || 'Unknown Party';
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Active Contracts</CardTitle>
        <CardDescription className="text-muted-foreground">
          View and manage your finalized agreements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeContracts.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground text-center">
              <FileText className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2">No active contracts found.</p>
              <p className="text-sm">Finalized agreements will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    Agreement ID
                  </th>
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    Title
                  </th>
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    Party
                  </th>
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    Type
                  </th>
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    Status
                  </th>
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    Created
                  </th>
                  <th className="text-muted-foreground pb-3 text-right text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeContracts.map((agreement) => (
                  <tr
                    key={agreement.id}
                    className="border-border border-b last:border-0"
                  >
                    <td className="text-foreground py-4 font-mono text-sm">
                      {agreement.id.slice(0, 8)}...
                    </td>
                    <td className="text-foreground py-4 text-sm font-medium">
                      {agreement.title || 'Untitled Agreement'}
                    </td>
                    <td className="text-foreground py-4 text-sm">
                      {getOtherPartyName(agreement)}
                    </td>
                    <td className="text-foreground py-4 text-sm">
                      {agreement.agreement_type}
                    </td>
                    <td className="py-4">
                      <Badge
                        variant="default"
                        className="border-green-500/20 bg-green-500/20 text-green-600"
                      >
                        Finalized
                      </Badge>
                    </td>
                    <td className="text-muted-foreground py-4 text-sm">
                      {formatDate(agreement.created_at)}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewContract(agreement.id)}
                        >
                          <FileText className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLedger(agreement.id)}
                        >
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
        )}
      </CardContent>
    </Card>
  );
}
