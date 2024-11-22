"use client";

import { GameMessages } from "@repo/chess/gameStatus";
import { remoteGameIdAtom } from "@repo/store/gameMetadata";
import { useSocketContext } from "@repo/ui/context/socketContext";
import { Clock } from "lucide-react";
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
        flex
        items-center
        justify-center
        p-6
        transition-all duration-300
        border-l
        ${isActive
        ? 'bg-amber-900/20 text-amber-200 border-amber-600/20 animate-pulse'
        : 'bg-neutral-900/50 text-neutral-400 border-neutral-800'}
      }
      `}>
      <div className="flex items-center space-x-2">
        <Clock
          className={`
              w-5
              h-5
              ${isActive
              ? 'text-amber-400'
              : 'text-neutral-500'
            }
            `}
        />
        <span className={`
            font-mono
            text-lg
            ${isActive
            ? 'text-amber-200 border-amber-600/20 animate-pulse'
            : 'bg-neutral-900/50 text-neutral-400 border-neutral-800'}
          }
            ${isPaused ? 'opacity-50' : ''}
          `}>
          {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
        </span>
        {isPaused && (
          <span className="ml-2 text-xs text-amber-500 bg-amber-900/30 px-2 py-1 rounded-full">
            Paused
          </span>
        )}
      </div>
    </div>
  );
}

export default TimerCountDown;
