import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Shield, Mail } from 'lucide-react';
import { mockUser, mockInviter } from '@/lib/mock-data/agreements';

export function PartiesInfo() {
  const parties = [
    { ...mockUser, role: 'Creator' },
    { ...mockInviter, role: 'Invitee' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Agreement Parties</h2>
        <p className="text-muted-foreground">
          Review the parties involved in this agreement
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {parties.map((party) => (
          <div
            key={party.id}
            className="border-border bg-card/50 rounded-lg border-2 p-6"
          >
            <div className="flex items-start gap-4">
              <Avatar
                className="ring-primary/20 h-16 w-16 ring-2"
                style={{ backgroundColor: party.color }}
              >
                <AvatarFallback>{party.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{party.name}</h3>
                  {party.verified && (
                    <CheckCircle2 className="text-primary h-5 w-5" />
                  )}
                </div>
                <Badge variant="secondary" className="mb-3">
                  {party.role}
                </Badge>
                <div className="space-y-2">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>{party.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="text-primary h-4 w-4" />
                    <span className="font-medium">
                      Trust Score: {party.trustScore ?? 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
