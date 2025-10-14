'use client';

interface TransactionProgressProps {
  currentSection: number;
  totalSections: number;
  onSectionClick?: (index: number) => void;
}

export function TransactionProgress({
  currentSection,
  totalSections,
  onSectionClick,
}: TransactionProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {Array.from({ length: totalSections }).map((_, index) => (
        <div key={index} className="flex items-center">
          <button
            onClick={() => onSectionClick?.(index)}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
              index <= currentSection
                ? 'scale-110 bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)] hover:shadow-[0_0_30px_rgba(16,185,129,0.8)]'
                : 'bg-neutral-800 text-neutral-500 hover:scale-105 hover:bg-neutral-700'
            } ${index === currentSection ? 'ring-4 ring-emerald-400/30' : ''}`}
            disabled={onSectionClick === undefined}
          >
            {index + 1}
          </button>
          {index < totalSections - 1 && (
            <div
              className={`h-1.5 w-16 rounded-full transition-all duration-300 ${
                index < currentSection
                  ? 'bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  : 'bg-neutral-800'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
