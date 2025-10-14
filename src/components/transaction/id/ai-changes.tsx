import { Card, CardContent } from '@/components/ui/card';

type Amendment = {
  field: string;
  from: string;
  to: string;
  reason: string;
};

type AIChangesProps = {
  aiChanges: {
    original: string;
    originalLines: string[];
    modifiedLines: string[];
    amendments: Amendment[];
  };
};

export function AIChangesCard({ aiChanges }: AIChangesProps) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div>
          <p className="mb-2 text-xs text-neutral-500">Original AI Summary</p>
          <div className="rounded-lg border border-neutral-800/50 bg-black/40 p-3">
            <p className="text-sm text-neutral-300">{aiChanges.original}</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-neutral-500">
            Amendments Based on Your Input
          </p>
          <div className="space-y-2">
            {aiChanges.amendments.map((amendment, index) => (
              <div
                key={index}
                className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
                    <span className="text-xs font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-300">
                      {amendment.field}
                    </p>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-neutral-400">
                        <span className="line-through">{amendment.from}</span>
                      </p>
                      <p className="text-xs font-medium text-white">
                        → {amendment.to}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500 italic">
                      {amendment.reason}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-800 bg-black/60">
          <div className="border-b border-neutral-800 bg-neutral-900 px-3 py-2">
            <p className="font-mono text-xs text-neutral-400">
              Original vs Modified Summary
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {aiChanges.originalLines.map((line, index) => {
              const modifiedLine = aiChanges.modifiedLines[index];
              const isChanged = line !== modifiedLine;
              return (
                <div key={index}>
                  {isChanged && (
                    <div className="flex items-start border-l-4 border-red-500 bg-red-500/10">
                      <span className="w-12 flex-shrink-0 px-3 py-1 font-mono text-xs text-red-400 select-none">
                        -{index + 1}
                      </span>
                      <span className="flex-1 px-3 py-1 font-mono text-xs text-red-300">
                        {line}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex items-start ${
                      isChanged
                        ? 'border-l-4 border-emerald-500 bg-emerald-500/10'
                        : 'border-l-4 border-transparent bg-transparent'
                    }`}
                  >
                    <span
                      className={`w-12 flex-shrink-0 px-3 py-1 font-mono text-xs select-none ${
                        isChanged ? 'text-emerald-400' : 'text-neutral-600'
                      }`}
                    >
                      {isChanged ? `+${index + 1}` : ` ${index + 1}`}
                    </span>
                    <span
                      className={`flex-1 px-3 py-1 font-mono text-xs ${
                        isChanged ? 'text-emerald-300' : 'text-neutral-400'
                      }`}
                    >
                      {modifiedLine}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
