import TimerCountDown from "../chess/TimerCountDown";

interface PlayerTimerProps {
  playerName: string;
  duration: number;
  isPaused: boolean;
}

const PlayerTimer: React.FC<PlayerTimerProps> = ({ playerName, duration, isPaused }) => (
  <div className="player-timer">
    <h3>{playerName}</h3>
    <TimerCountDown duration={duration} isPaused={isPaused} />
  </div>
);

export default PlayerTimer;
