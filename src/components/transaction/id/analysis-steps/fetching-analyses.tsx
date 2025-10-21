import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function FetchingAnalyses() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading analysis...</span>
      </CardContent>
    </Card>
  );
}
