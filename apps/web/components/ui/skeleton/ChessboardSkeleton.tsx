import React from 'react';

const ChessboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-800/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-8xl px-4">
        <div className="rounded-2xl p-6 grid md:grid-cols-3 gap-6">
          {/* Left Column: Player Timers and Chessboard */}
          <div className="md:col-span-2 space-y-6">
            {/* Opponent Timer */}
            <div className="bg-amber-900/20 text-amber-200 border-amber-600/20 rounded-xl p-4 flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-amber-600/20 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-amber-600/20 rounded" />
                  <div className="h-3 w-24 bg-amber-600/20 rounded" />
                </div>
              </div>
              <div className="h-5 w-16 bg-amber-600/20 rounded" />
            </div>

            {/* Chessboard Placeholder */}
            <div className="aspect-square bg-amber-900/20 text-amber-200 border-amber-600/20 rounded-xl animate-pulse" />

            {/* Current Player Timer */}
            <div className="bg-amber-900/20 text-amber-200 border-amber-600/20 rounded-xl p-4 flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-amber-600/20 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-amber-600/20 rounded" />
                  <div className="h-3 w-24 bg-amber-600/20 rounded" />
                </div>
              </div>
              <div className="h-5 w-16 bg-amber-600/20 rounded" />
            </div>
          </div>

          {/* Right Column: Moves Table */}
          <div className="flex-[2] bg-amber-900/20 text-amber-200 border-amber-600/20 w-full rounded-xl p-4 space-y-4 animate-pulse">
            <div className="h-16 w-full bg-amber-600/20 rounded" />
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-12 flex-1 bg-amber-600/20 rounded" />
                <div className="h-12 flex-1 bg-amber-600/20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessboardSkeleton;
