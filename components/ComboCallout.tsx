
import React from 'react';
import { Phase, WorkoutState } from '../types';

interface ComboCalloutProps {
    combo: string;
    phase: Phase;
    workoutState: WorkoutState;
}

export const ComboCallout: React.FC<ComboCalloutProps> = ({ combo, phase, workoutState }) => {
    const getBorderStyle = () => {
        if (workoutState === WorkoutState.RUNNING) {
            return phase === Phase.WORK ? 'border-work' : 'border-rest';
        }
        if (workoutState === WorkoutState.FINISHED) {
            return 'border-green-500';
        }
        return 'border-slate-700';
    };

    const getTextColor = () => {
        if (workoutState === WorkoutState.IDLE) return 'text-slate-400 text-base';
        if (workoutState === WorkoutState.PAUSED) return 'text-slate-400 text-3xl';
        if (workoutState === WorkoutState.FINISHED) return 'text-green-400 text-3xl';
        
        if (phase === Phase.WORK) {
            return 'text-amber-500 font-extrabold';
        } else {
            return 'text-green-400';
        }
    };
    
    const comboDisplay = combo.split('-').join(' ');

    return (
        <div className={`text-center text-2xl sm:text-3xl min-h-[50px] p-3 bg-slate-700/50 rounded-lg shadow-inner flex items-center justify-center border-2 transition-colors duration-300 ${getBorderStyle()}`}>
            <span className={getTextColor()}>
                 {workoutState === WorkoutState.IDLE ? 'Press Start to begin training!' : comboDisplay}
            </span>
        </div>
    );
};
