"use client";

import { GameMessages } from "@repo/chess/gameStatus";
import { remoteGameIdAtom } from "@repo/store/gameMetadata";
import { useSocketContext } from "@repo/ui/context/socketContext";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

interface TimerCountDownProps {
  duration: number;
  isPaused: boolean;
}

const TimerCountDown: React.FC<TimerCountDownProps> = ({ duration, isPaused }) => {
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
  const seconds: number = Math.floor((remainingTime % (1000 * 60)) / 1000);

  return <div>
    {minutes}m :{seconds}s
  </div>
}

export default TimerCountDown;
