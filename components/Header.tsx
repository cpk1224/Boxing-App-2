
import React from 'react';
import { Maximize, Minimize } from 'lucide-react';

interface HeaderProps {
    workoutName: string;
    isFullScreen: boolean;
    onToggleFullScreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ workoutName, isFullScreen, onToggleFullScreen }) => (
    <header className="text-center flex justify-between items-center">
        <div className="w-1/5"></div>
        <div className="flex-grow">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide">Fight Me</h1>
            <p className="text-lg sm:text-xl text-slate-400 mt-1 min-h-[28px]">{workoutName}</p>
        </div>
        <div className="w-1/5 flex justify-end">
            <button
                onClick={onToggleFullScreen}
                title="Toggle Fullscreen"
                className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition duration-150 active:scale-95"
            >
                {isFullScreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </button>
        </div>
    </header>
);
