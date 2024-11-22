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
      ps-4 rounded-xl
      overflow-hidden
      border-2
      transition-all duration-300
      ${isActive
        ? 'border-amber-700/30 bg-gradient-to-r from-amber-900/30 to-amber-800/30'
        : 'border-neutral-800 bg-gradient-to-b from-neutral-900/50 to-neutral-950/50'
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
                width={56}
                height={56}
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
              absolute
              bottom-[-8px]
              right-[-8px]
              z-20
              w-8
              h-8
              rounded-full
              flex
              items-center
              justify-center
              bg-amber-900/30
              border
              border-amber-700/50
              transition-transform
              transform
              hover:scale-110
            `}>
              <Image
                src={`/cardinal/${color[0]}/p.svg`}
                alt={`${color} pawn`}
                width={30}
                height={30}
                className="brightness-125 hover:brightness-150"
              />
            </div>
          )}
        </div>
        <div>
          <h3 className={`
            text-md
            font-medium
            ${isActive
              ? 'text-amber-200'
              : 'text-neutral-400'}
              transition-colors
              duration-300
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
