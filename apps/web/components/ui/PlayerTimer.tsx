import Image from "next/image";
import TimerCountDown from "../chess/TimerCountDown";
import { User } from "lucide-react";

interface PlayerTimerProps {
  playerName: string;
  duration: number;
  isPaused: boolean;
  avatar?: string;
  isActive?: boolean;
  color: 'white' | 'black';
}

const PlayerTimer: React.FC<PlayerTimerProps> = ({
  playerName,
  duration,
  isPaused = false,
  avatar,
  isActive = false,
  color
}) => {
  return (
    <div className={`
      flex items-center justify-between
      p-4 rounded-xl
      border-2
      ${isActive
        ? 'border-amber-600/20 bg-amber-900/20'
        : 'border-neutral-800 bg-neutral-900/50'
      }
      transition-all duration-300
    `}>
      <div className="flex items-center space-x-4">
        <div className="relative">
          {avatar ? (
            <div className="relative">
              <Image
                src={avatar}
                alt={`${playerName}'s avatar`}
                width={48}
                height={48}
                className={`
              rounded-full
              object-cover
              border-2
              ${isActive
                    ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'border-neutral-700'
                  }
            `}
              />
              {isActive && (
                <div className="absolute inset-0 rounded-full animate-ping bg-amber-500/20 pointer-events-none" />
              )}
            </div>
          ) : (
            <div className={`
          w-12 h-12
          rounded-full
          flex items-center justify-center
          border-2
          relative
          ${isActive
                ? 'border-amber-600 bg-amber-900/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'border-neutral-700 bg-neutral-800'
              }
        `}>
              {isActive && (
                <div className="absolute inset-0 rounded-full animate-ping bg-amber-500/20 pointer-events-none" />
              )}
              <User className={`
            ${isActive
                  ? 'text-amber-400'
                  : 'text-neutral-500'
                } relative z-10
          `} size={24} />
            </div>
          )}
          {color && (
            <div className={`
          absolute bottom-0 right-0
          w-5 h-5
          rounded-full
          flex items-center justify-center
          border
          ${color === 'white'
                ? 'bg-white border-neutral-600 text-black'
                : 'bg-black text-white border-neutral-700'
              }
        `}>
              <span className="text-xs">
                {color === 'white' ? '♙' : '♟'}
              </span>
            </div>
          )}
        </div>
        <div>
          <h3 className={`
            text-md font-medium
            ${isActive
              ? 'text-amber-200'
              : 'text-neutral-400'}
            transition-colors duration-300
          `}>
            {playerName}
          </h3>
        </div>
      </div>
      <TimerCountDown
        duration={duration}
        isPaused={isPaused}
        isActive={isActive}
      />
    </div>
  );
};

export default PlayerTimer;
