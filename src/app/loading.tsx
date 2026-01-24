import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(1,208,108,0.08)_0%,transparent_60%)]" />

      {/* Logo container with rotating ring */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Rotating arc ring */}
        <div
          className="absolute h-28 w-28 animate-spin"
          style={{ animationDuration: '2s' }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(1, 208, 108, 0.15)"
              strokeWidth="1"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#01d06c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="72 216"
            />
          </svg>
        </div>

        {/* Static logo */}
        <div className="relative h-14 w-14">
          <Image
            src="/logo-original.svg"
            alt="Sabot"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
