'use client';

// Mock cursor data
const mockCursors = [
  { id: '1', name: 'John Doe', color: '#1DB954', x: 45, y: 30 },
  { id: '2', name: 'Jane Smith', color: '#FF6B6B', x: 65, y: 50 },
];

export function CursorOverlay() {
  return (
    <>
      {mockCursors.map((cursor) => (
        <div
          key={cursor.id}
          className="pointer-events-none absolute z-50 animate-pulse transition-all duration-100"
          style={{
            left: `${cursor.x}%`,
            top: `${cursor.y}%`,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          >
            <path
              d="M5.65376 12.3673L8.84496 15.5585L12.9316 21.9L14.3801 20.4515L10.2935 14.1102L13.4847 10.919L5.65376 12.3673Z"
              fill={cursor.color}
            />
          </svg>
          <div
            className="-mt-4 ml-6 rounded px-2 py-1 text-xs font-medium whitespace-nowrap text-white"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </>
  );
}
