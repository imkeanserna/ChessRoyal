"use client";

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Clock, Trophy } from 'lucide-react';
import { Card, CardContent } from '@repo/ui/components/ui/card';
import GameHistorySkeleton from './ui/skeleton/GameHistorySkeleton';
import { toast } from '@repo/ui/components/ui/sonner';

interface GameHistoryItem {
  id: string;
  date: Date;
  duration: number;
  result: string;
  opponent: string;
  resultType: string;
  player: {
    name: string;
    isGuest: boolean;
  };
  score: number;
}

const ChessGameHistory = ({ userId }: { userId: string }) => {
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const transformGames = (rawGames: any[], userId: string): GameHistoryItem[] => {
    return rawGames.map(game => {
      const isWhitePlayer = game.result.whitePlayerId === userId;
      const isBlackPlayer = game.result.blackPlayerId === userId;

      // Determine opponent name and player name
      const opponentName = isWhitePlayer
        ? game.result.blackPlayerName
        : game.result.whitePlayerName;
      const playerName = isWhitePlayer
        ? game.result.whitePlayerName
        : game.result.blackPlayerName;

      // Calculate duration (in seconds)
      const duration = isWhitePlayer
        ? Math.floor((3600000 - game.whitePlayerRemainingTime) / 1000)
        : Math.floor((3600000 - game.blackPlayerRemainingTime) / 1000);

      // Determine result
      const winnerId = game.result.winnerId;
      const result = winnerId === userId ? 'win' : winnerId && winnerId !== userId ? 'loss' : 'draw';

      const score = userId === game.result.whitePlayerId
        ? game.result.whiteScore
        : game.result.blackScore;

      return {
        id: game.id,
        date: new Date(game.createdAt),
        duration,
        result,
        resultType: game.result.resultType.toLowerCase(),
        opponent: opponentName,
        player: {
          name: playerName,
          isGuest: playerName.startsWith('Guest')
        },
        score
      };
    });
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response: any = await fetch(`/api/game/me`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const { games, success } = await response.json();

        if (success) {
          const transformedGames = transformGames(games, userId);
          setGames(transformedGames);
        }
      } catch (error) {
        toast.error("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, [userId]);

  useEffect(() => {
    if (!scrollContainerRef.current || isHovering) return;

    const scrollContainer = scrollContainerRef.current;
    const scrollAmount = scrollContainer.clientWidth;
    let scrollInterval: NodeJS.Timeout;

    const startScroll = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer.scrollLeft + scrollAmount >= scrollContainer.scrollWidth) {
          // Reset scroll position for infinite loop effect
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += 1;
        }
      }, 30);
    };

    startScroll();

    return () => {
      clearInterval(scrollInterval);
    };
  }, [games, isHovering]);

  useEffect(() => {
    const checkScrollCapabilities = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollWidth > clientWidth && scrollLeft + clientWidth < scrollWidth);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollCapabilities);
      checkScrollCapabilities();
      return () => scrollContainer.removeEventListener('scroll', checkScrollCapabilities);
    }

  }, [games]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Helper function to format duration
  const formatDuration = (duration: any) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Color and icon for game result
  const getResultStyle = (result: string) => {
    switch (result) {
      case 'win':
        return {
          icon: <Trophy className="w-5 h-5 text-green-500" />,
          color: 'text-green-500'
        };
      case 'loss':
        return {
          icon: <Trophy className="w-5 h-5 text-red-500" />,
          color: 'text-red-500'
        };
      default:
        return {
          icon: <Trophy className="w-5 h-5 text-yellow-500" />,
          color: 'text-yellow-500'
        };
    }
  };

  const handleHover = (isHovering: boolean) => {
    setIsHovering(isHovering);
  };

  if (loading) {
    return (
      <GameHistorySkeleton count={4} />
    );
  }

  if (games.length === 0) {
    return (
      <div className="bg-neutral-900 p-6 rounded-xl text-center text-neutral-400">
        No games played yet. Start a new game to see your history!
      </div>
    );
  }

  return (
    <div className="relative p-6 rounded-2xl shadow-2xl max-w-6xl mx-auto backdrop-blur-sm bg-orange-950/15">
      <h2 className="text-xl font-extrabold text-amber-100 mb-8 flex items-center gap-4 border-b border-amber-700 pb-4">
        <Trophy className="w-6 h-6 text-amber-500" />
        Game History
      </h2>

      {/* Navigation Buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-[60%] -translate-y-1/2 z-20
            bg-neutral-800/70 hover:bg-amber-900/30
            rounded-full p-3 shadow-xl transition-all duration-300
            hover:scale-110 hover:shadow-2xl"
          onMouseEnter={() => handleHover(true)}
          onMouseLeave={() => handleHover(false)}
        >
          <ArrowLeft className="text-amber-500 w-6 h-6" />
        </button>
      )
      }

      {
        canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-[60%] -translate-y-1/2 z-20
          bg-neutral-800/70 hover:bg-amber-900/30
          rounded-full p-3 shadow-xl transition-all duration-300
          hover:scale-110 hover:shadow-2xl"
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
          >
            <ArrowRight className="text-amber-500 w-6 h-6" />
          </button>
        )
      }

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto scrollbar-hide py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex space-x-4 w-max">
          {games.map((game) => {
            const resultStyle = getResultStyle(game.result);
            return (
              <Card
                key={game.id}
                className={`w-[300px] flex-shrink-0
                          border-2 border-amber-700/20
                          transform transition-all duration-300
                          hover:scale-105
                        ${game.result === 'win'
                    ? 'hover:shadow-[0_10px_25px_-3px_rgba(34,197,94,0.6)]'
                    : game.result === 'loss'
                      ? 'hover:shadow-[0_10px_25px_-3px_rgba(239,68,68,0.6)]'
                      : 'hover:shadow-[0_10px_25px_-3px_rgba(251,191,36,0.6)]'
                  }
                          overflow-hidden rounded-xl
                          bg-gradient-to-br
                          from-neutral-900/90 via-neutral-900/90 to-neutral-950/90
                          group relative
                        ${game.result === 'win'
                    ? 'bg-gradient-to-br from-green-500/20 via-neutral-900/90 to-neutral-950/90'
                    : game.result === 'loss'
                      ? 'bg-gradient-to-br from-red-500/20 via-neutral-900/90 to-neutral-950/90'
                      : 'bg-gradient-to-br from-amber-500/20 via-neutral-900/90 to-neutral-950/90'
                  }
              `}
                onMouseEnter={() => handleHover(true)}
                onMouseLeave={() => handleHover(false)}
              >
                {/* Dynamic Gradient Overlay on Hover */}
                <div
                  className={`absolute inset-0 pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity duration-300`}
                >
                  <div
                    className={`absolute top-0 left-0 w-[80px] h-[80px] blur-xl ${game.result === 'win'
                      ? 'bg-gradient-to-br from-green-500/60 to-transparent'
                      : game.result === 'loss'
                        ? 'bg-gradient-to-br from-red-500/60 to-transparent'
                        : 'bg-gradient-to-br from-amber-500/60 to-transparent'
                      }`}
                  ></div>
                </div>

                <CardContent className="p-3 space-y-3">
                  {/* Game Header */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {resultStyle.icon}
                      <span className={`text-xs font-bold uppercase ${resultStyle.color}`}>
                        {game.result}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-200/50">
                      {game.date.toLocaleDateString()}
                    </span>
                  </div>

                  {/* Opponent and Difficulty */}
                  <div className="flex justify-between items-center">
                    <div className="text-amber-100 font-bold text-xs truncate max-w-[120px]">
                      {game.opponent} {game.player.isGuest ? '(Guest)' : ''}
                    </div>
                  </div>

                  {/* Game Stats */}
                  <div className="grid grid-cols-3 gap-1 bg-neutral-950/50 rounded-lg p-2">
                    <div className="flex flex-col items-center">
                      <div className="text-base font-bold text-amber-500">
                        {game.result === 'win' ? '+' : game.result === 'loss' ? '-' : ''}
                        {game.score}
                      </div>
                      <div className="text-[10px] text-amber-200/50 mt-0.5">Score</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-base font-bold text-amber-100 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-amber-500/50" />
                        {formatDuration(game.duration)}
                      </div>
                      <div className="text-[10px] text-amber-200/50 mt-0.5">Duration</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-base capitalize font-bold text-amber-100 overflow-hidden overflow-ellipsis" title={game.resultType}>
                        {game.resultType.length > 12 ? `${game.resultType.substring(0, 12)}...` : game.resultType}
                      </div>
                      <div className="text-[10px] text-amber-200/50 mt-0.5">Result Type</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div >
  );
};

export default ChessGameHistory;
