import React from 'react';
import { Trophy, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameHistorySkeletonProps {
  count?: number;
}

const GameHistorySkeleton: React.FC<GameHistorySkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="relative p-6 rounded-2xl shadow-2xl max-w-6xl mx-auto backdrop-blur-sm bg-orange-950/15">
      <h2 className="text-xl font-extrabold text-amber-100 mb-8 flex items-center gap-4 border-b border-amber-700 pb-4">
        <Trophy className="w-6 h-6 text-amber-500" />
        Game History
      </h2>

      <button
        className="absolute left-2 top-[60%] -translate-y-1/2 z-20
          bg-neutral-800/70
          rounded-full p-3 shadow-xl opacity-30"
      >
        <ArrowLeft className="text-amber-500 w-6 h-6" />
      </button>

      <button
        className="absolute right-2 top-[60%] -translate-y-1/2 z-20
          bg-neutral-800/70
          rounded-full p-3 shadow-xl opacity-30"
      >
        <ArrowRight className="text-amber-500 w-6 h-6" />
      </button>

      <div className="w-full overflow-x-auto scrollbar-hide py-2">
        <div className="flex space-x-4 w-max">
          {[...Array(count)].map((_, index) => (
            <div
              key={index}
              className={`w-[300px] flex-shrink-0
                border-2 border-amber-700/20
                overflow-hidden rounded-xl
                bg-gradient-to-br
                from-neutral-900/90 via-neutral-900/90 to-neutral-950/90
                animate-pulse`}
            >
              <div className="p-3 space-y-3">
                {/* Game Header Skeleton */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-16 bg-neutral-700/50 rounded" />
                  </div>
                  <div className="h-3 w-16 bg-neutral-700/50 rounded" />
                </div>

                {/* Opponent Skeleton */}
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-neutral-700/50 rounded" />
                </div>

                {/* Game Stats Skeleton */}
                <div className="grid grid-cols-3 gap-1 bg-neutral-950/50 rounded-lg p-2">
                  {[...Array(3)].map((_, statIndex) => (
                    <div key={statIndex} className="flex flex-col items-center">
                      <div className="h-5 w-12 bg-neutral-700/50 rounded mb-1" />
                      <div className="h-3 w-10 bg-neutral-700/50 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameHistorySkeleton;
