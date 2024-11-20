"use client";

import { GameMessages } from "@repo/chess/gameStatus";
import { remoteGameIdAtom } from "@repo/store/gameMetadata";
import { useSocketContext } from "@repo/ui/context/socketContext";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

interface TimerCountDownProps {
  duration: number;
  isPaused: boolean;
  isActive: boolean;
}

const TimerCountDown: React.FC<TimerCountDownProps> = ({ duration, isPaused, isActive }) => {
  const [remainingTime, setRemainingTime] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout>();
  const { sendMessage } = useSocketContext();
  const gameId = useRecoilValue(remoteGameIdAtom);

  useEffect(() => {
    if (!isPaused) {
      const endTime: number = new Date().getTime() + remainingTime;

      timerRef.current = setInterval(() => {
        const timeLeft = endTime - new Date().getTime();

        if (timeLeft <= 0) {
          clearInterval(timerRef.current);
          setRemainingTime(0);
          sendMessage(GameMessages.TIMER, {
            gameId
          });
        } else {
          setRemainingTime(timeLeft);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [remainingTime, isPaused]);

  const minutes: number = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds: string = String(Math.floor((remainingTime % (1000 * 60)) / 1000)).padStart(2, '0');

  return (
    <div className={`
      inline-flex items-center justify-center
      px-4 py-2
      rounded-xl
      font-mono
      transition-all duration-300
      border-2
      ${isActive
        ? 'bg-amber-900/20 text-amber-200 border-amber-600/20 animate-pulse'
        : 'bg-neutral-900/50 text-neutral-400 border-neutral-800'}
    `}>
      <span className="text-xl font-semibold">
        {minutes}:{seconds}
      </span>
    </div>
  );
}

export default TimerCountDown;
