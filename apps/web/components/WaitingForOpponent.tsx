"use client";

import React from "react";
import { Loader2 } from 'lucide-react';

interface WaitingForOpponentProps {
  isWaiting: boolean;
}

const WaitingForOpponent: React.FC<WaitingForOpponentProps> = ({ isWaiting }) => {
  if (!isWaiting) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-neutral-900/90 border border-amber-600/20 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center gap-6">
          {/* Animated chess pieces */}
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full opacity-20" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 3L12 6L15 3M12 6V14M12 14L7 9M12 14L17 9M5 21H19M7 17L12 14L17 17" />
              </svg>
            </div>

            <div className="absolute inset-0">
              <div className="w-full h-full animate-spin-slow">
                <div className="w-2 h-2 bg-amber-400 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2" />
              </div>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <h2 className="text-xl font-semibold text-amber-100">Finding Your Opponent</h2>

            <div className="flex items-center gap-2 text-amber-200/60">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p>Searching for a worthy challenger</p>
            </div>
          </div>

          {/* Animated progress bar */}
          <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 animate-progress" />
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-sm text-amber-200/40">
            {['Analyzing player pool', 'Matching skill levels', 'Preparing the board'].map((text, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-neutral-800/50 animate-pulse"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForOpponent;
