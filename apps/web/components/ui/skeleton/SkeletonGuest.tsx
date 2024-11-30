import React from 'react';

interface SkeletonProps {
  count?: number;
}

const SkeletonGuest: React.FC<SkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-900 to-amber-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,53,15,0.4),rgba(0,0,0,0))]" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-800/10 rounded-full blur-3xl" />
      </div>
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[repeating-conic-gradient(theme(colors.amber.900)_0%_25%,theme(colors.transparent)_0%_50%)] bg-[length:40px_40px]" />
      </div>

      {/* Skeleton Loading UI */}
      <div className="relative z-10 w-full max-w-md space-y-8 p-8">
        <div className="text-center mb-12">
          {/* Skeleton Header */}
          <div className="h-12 w-3/4 mx-auto bg-amber-900/90 opacity-90 animate-pulse rounded mb-4" />
          <div className="h-4 w-1/2 mx-auto bg-amber-900/90 opacity-90 animate-pulse rounded" />
        </div>

        {/* Skeleton Items */}
        <div className="space-y-4">
          {[...Array(count)].map((_, index) => (
            <div
              key={index}
              className="w-full h-14 bg-amber-900/90 opacity-90 animate-pulse rounded-lg"
            />
          ))}
        </div>

        {/* Skeleton Footer */}
        <div className="text-center">
          <div className="h-4 w-3/4 mx-auto bg-amber-900/90 opacity-90 animate-pulse rounded mt-8" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonGuest;
