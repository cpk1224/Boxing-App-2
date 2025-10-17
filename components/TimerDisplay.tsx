
import React, { useMemo } from 'react';
import { Phase } from '../types';

interface TimerDisplayProps {
    timeRemaining: number;
    totalTimeRemaining: number;
    phase: Phase;
}

const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeRemaining, totalTimeRemaining, phase }) => {
    const timerColor = useMemo(() => {
        if (timeRemaining <= 10 && timeRemaining > 0 && timeRemaining % 2 === 0) {
            return 'text-warn';
        }
        return phase === Phase.WORK ? 'text-work' : 'text-rest';
    }, [timeRemaining, phase]);

    return (
        <div className="text-center py-2 space-y-2">
            <div className="text-lg text-slate-400 font-semibold tabular-nums">
                Total Remaining: {formatTime(totalTimeRemaining)}
            </div>
            <div id="timer-display" className={`font-extrabold text-white tracking-tighter tabular-nums transition-colors duration-200 ${timerColor}`}>
                {formatTime(timeRemaining)}
            </div>
        </div>
    );
};
