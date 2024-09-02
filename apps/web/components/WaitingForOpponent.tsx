"use client";

import React from "react";

interface WaitingForOpponentProps {
  isWaiting: boolean;
}

const WaitingForOpponent: React.FC<WaitingForOpponentProps> = ({ isWaiting }) => {
  return (
    <div>
      {isWaiting && (
        <div className="w-full h-full flex flex-col justify-center items-center gap-4 text-lg">
          Waiting for opponent...
        </div>
      )}
    </div>
  );
};

export default WaitingForOpponent;
