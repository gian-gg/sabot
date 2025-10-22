import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { User, AlertTriangle, CheckCircle } from 'lucide-react';
import type { AnalysisData } from '@/types/analysis';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';

interface AnalysisCompleteProps {
  analyses: AnalysisData[];
  transactionId: string;
}

export function AnalysisComplete({
  analyses,
  transactionId,
}: AnalysisCompleteProps) {
  const { status } = useTransactionStatus(transactionId);

  const getParticipantRole = (userId: string) => {
    if (!status?.participants) return 'Party';

    const participant = status.participants.find((p) => p.user_id === userId);
    if (!participant) return 'Party';

    // Creator is typically the seller, invitee is typically the buyer
    return participant.role === 'creator' ? 'Seller' : 'Buyer';
  };

  const getConditionBadgeVariant = (
    condition: string | undefined
  ): {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className: string;
  } => {
    if (!condition) return { variant: 'secondary', className: '' };

    const normalized = condition.toLowerCase();

    if (normalized.includes('new') || normalized.includes('excellent')) {
      return {
        variant: 'outline',
        className: 'border-green-500/50 bg-green-500/10 text-green-400',
      };
    }
    if (normalized.includes('good')) {
      return {
        variant: 'outline',
        className: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
      };
    }
    if (normalized.includes('fair')) {
      return {
        variant: 'outline',
        className: 'border-gray-400/50 bg-gray-400/10 text-gray-300',
      };
    }
    if (normalized.includes('bad') || normalized.includes('poor')) {
      return {
        variant: 'destructive',
        className: 'border-red-500/50 bg-red-500/10 text-red-400',
      };
    }

    return { variant: 'secondary', className: '' };
  };
  return (
    <div className="w-full space-y-6">
      {analyses.map((analysis, index) => {
        const conditionBadge = getConditionBadgeVariant(
          analysis.productCondition
        );
        return (
          <Card key={analysis.id || index}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="text-muted-foreground h-5 w-5" />
                <CardTitle>
                  {getParticipantRole(analysis.user_id)}&apos;s Conversation
                </CardTitle>
                <Badge variant="outline" className="capitalize">
                  {analysis.platform}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Screenshot Image */}
                <div className="space-y-3">
                  <h4 className="text-muted-foreground text-sm font-medium">
                    Screenshot
                  </h4>
                  <div className="bg-muted/50 overflow-hidden rounded-lg border">
                    <img
                      src={analysis.screenshot_url}
                      alt="Conversation screenshot"
                      className="h-auto w-full object-contain"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                </div>

                {/* Analysis Data */}
                <div className="space-y-3">
                  <h4 className="text-muted-foreground text-sm font-medium">
                    Extracted Information
                  </h4>

                  <div className="space-y-3">
                    {analysis.itemDescription && (
                      <Card className="border-border/50 shadow-none">
                        <CardContent className="px-4 py-3">
                          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                            Item Details
                          </span>
                          <p className="mt-1.5 text-sm leading-relaxed font-medium">
                            {analysis.itemDescription}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {analysis.productType && (
                              <Badge variant="secondary" className="text-xs">
                                {analysis.productType}
                              </Badge>
                            )}
                            {analysis.productModel && (
                              <Badge variant="secondary" className="text-xs">
                                {analysis.productModel}
                              </Badge>
                            )}
                            {analysis.productCondition && (
                              <Badge
                                variant={conditionBadge.variant}
                                className={conditionBadge.className}
                              >
                                {analysis.productCondition}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Card className="border-border/50 shadow-none">
                        <CardContent className="px-4 py-3">
                          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                            Transaction Method
                          </span>
                          <p className="mt-1.5 text-sm font-semibold capitalize">
                            {analysis.transactionType}
                          </p>
                        </CardContent>
                      </Card>

                      {analysis.proposedPrice && (
                        <Card className="border-border/50 shadow-none">
                          <CardContent className="px-4 py-3">
                            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                              Price
                            </span>
                            <p className="text-primary mt-1.5 text-lg font-bold">
                              {analysis.currency || 'USD'}{' '}
                              {(analysis.proposedPrice || 0).toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {(analysis.meetingLocation || analysis.meetingTime) && (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {analysis.meetingLocation && (
                          <Card className="border-border/50 shadow-none">
                            <CardContent className="px-4 py-3">
                              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                Location
                              </span>
                              <p className="mt-1.5 text-sm font-medium">
                                {analysis.meetingLocation}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {analysis.meetingTime && (
                          <Card className="border-border/50 shadow-none">
                            <CardContent className="px-4 py-3">
                              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                Time
                              </span>
                              <p className="mt-1.5 text-sm font-medium">
                                {analysis.meetingTime}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {analysis.extractedText && (
                      <Card className="border-border/50 shadow-none">
                        <CardContent className="px-4 py-3">
                          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                            Full Conversation
                          </span>
                          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                            {analysis.extractedText}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              {(analysis.riskFlags ?? []).length > 0 && (
                <Alert className="mt-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="mb-2 font-medium">
                      Potential Concerns Detected:
                    </div>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      {analysis.riskFlags?.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="border-t">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground text-sm">
                    Analysis Complete
                  </span>
                </div>
                <Badge variant="secondary">
                  {Math.round((analysis.confidence || 0) * 100)}% confidence
                </Badge>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
