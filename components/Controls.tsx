import React from 'react';
import { WorkoutState } from '../types';
import { Play, Pause, Square } from 'lucide-react';

interface ControlsProps {
    workoutState: WorkoutState;
    onStartPause: () => void;
    onStop: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ workoutState, onStartPause, onStop }) => {
    const isRunning = workoutState === WorkoutState.RUNNING;
    const isPaused = workoutState === WorkoutState.PAUSED;
    const isIdle = workoutState === WorkoutState.IDLE || workoutState === WorkoutState.FINISHED;

    let label = "Start Training";
    if (isRunning) label = "Pause Training";
    if (isPaused) label = "Resume Training";

    return (
        <div className="flex flex-col gap-4 justify-center">
            <button
                onClick={onStartPause}
                className="w-full text-slate-900 font-extrabold py-5 px-8 rounded-xl text-xl sm:text-2xl uppercase tracking-widest flex items-center justify-center space-x-3 transition duration-200 ease-in-out shadow-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-amber-500/50 active:scale-[0.99]"
            >
                {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                <span>{label}</span>
            </button>

            {!isIdle && (
                 <button
                    onClick={onStop}
                    className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-3 px-6 rounded-xl text-lg transition duration-150 ease-in-out shadow-md shadow-red-800/50 active:scale-[0.99] flex items-center justify-center space-x-2"
                >
                    <Square className="w-5 h-5" />
                    <span>Stop & Reset</span>
                </button>
            )}
        </div>
    );
};
