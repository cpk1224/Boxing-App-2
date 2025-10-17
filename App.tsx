import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { ComboCallout } from './components/ComboCallout';
import { TimerDisplay } from './components/TimerDisplay';
import { Configuration } from './components/Configuration';
import { Controls } from './components/Controls';
import { PreviewModal } from './components/PreviewModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Confetti } from './components/Confetti';
import type { Config } from './types';
import { WorkoutState, Phase } from './types';
import { INITIAL_CONFIG } from './constants';
import { useTTS } from './hooks/useTTS';
import { useSounds } from './hooks/useSounds';
import { useWakeLock } from './hooks/useWakeLock';
import { generateCombo } from './services/comboGenerator';

const App: React.FC = () => {
    const [config, setConfig] = useState<Config>(INITIAL_CONFIG);
    const [workoutState, setWorkoutState] = useState<WorkoutState>(WorkoutState.IDLE);
    const [phase, setPhase] = useState<Phase>(Phase.WORK);
    const [currentRound, setCurrentRound] = useState(1);
    const [timeRemaining, setTimeRemaining] = useState(config.roundDuration);
    const [currentCombo, setCurrentCombo] = useState<string>('');
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(75);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const { speak, isReady, initAudio } = useTTS();
    const { playStartBell, playEndBell, playWarningBeep } = useSounds();
    const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock();
    
    const timerIntervalRef = useRef<number | null>(null);
    const comboIntervalRef = useRef<number | null>(null);
    const lastMoveSideRef = useRef<string | null>(null);

    const totalWorkoutTime = useMemo(() => {
        if (config.numRounds <= 0) return 0;
        return (config.roundDuration + config.restDuration) * config.numRounds - config.restDuration;
    }, [config.roundDuration, config.restDuration, config.numRounds]);

    const totalTimeRemaining = useMemo(() => {
        if (workoutState === WorkoutState.IDLE || workoutState === WorkoutState.FINISHED) return totalWorkoutTime;
        const elapsedInPreviousRounds = (currentRound - 1) * (config.roundDuration + config.restDuration);
        const elapsedInCurrentPhase = phase === Phase.WORK 
            ? config.roundDuration - timeRemaining
            : config.roundDuration + (config.restDuration - timeRemaining);
        return Math.max(0, totalWorkoutTime - (elapsedInPreviousRounds + elapsedInCurrentPhase));
    }, [workoutState, currentRound, timeRemaining, phase, config, totalWorkoutTime]);

    const handleConfigChange = useCallback((newConfig: Partial<Config>) => {
        setConfig(prev => {
            const updated = {...prev, ...newConfig};
            if(workoutState === WorkoutState.IDLE || workoutState === WorkoutState.FINISHED) {
                setTimeRemaining(updated.roundDuration);
                setCurrentRound(1);
            }
            return updated;
        });
    }, [workoutState]);
    
    const handleMuteToggle = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const comboLoop = useCallback(() => {
        if (phase !== Phase.WORK) return;
        
        const { combo, lastSide } = generateCombo(config, lastMoveSideRef.current);
        lastMoveSideRef.current = lastSide;
        
        const comboText = combo.join(', ');
        setCurrentCombo(comboText);
        
        if (!isMuted) {
            speak(comboText.replace(/,/g, ' '), config.voiceName, volume / 100);
        }

    }, [phase, config, speak, volume, isMuted]);

    const stopIntervals = useCallback(() => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (comboIntervalRef.current) clearInterval(comboIntervalRef.current);
        timerIntervalRef.current = null;
        comboIntervalRef.current = null;
    }, []);

    const handleStop = useCallback((finished: boolean) => {
        stopIntervals();
        releaseWakeLock();
        setWorkoutState(WorkoutState.IDLE);
        setPhase(Phase.WORK);
        setCurrentRound(1);
        setTimeRemaining(config.roundDuration);
        setCurrentCombo('');
        lastMoveSideRef.current = null;

        if(finished) {
            setWorkoutState(WorkoutState.FINISHED);
            setCurrentCombo("WORKOUT COMPLETE!");
            if (!isMuted) speak("Workout Complete! Great job!", config.voiceName, volume / 100);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }, [config, speak, isMuted, volume, stopIntervals, releaseWakeLock]);
    
    useEffect(() => {
        if (workoutState !== WorkoutState.RUNNING) {
            return;
        }

        timerIntervalRef.current = window.setInterval(() => {
            setTimeRemaining(prev => {
                const newTime = prev - 1;

                if (newTime < 0) {
                     if (phase === Phase.WORK) { // End of Work
                        if (currentRound >= config.numRounds) {
                            handleStop(true);
                            return 0;
                        }
                        if (config.restDuration > 0) {
                            if (!isMuted) playEndBell();
                            if (!isMuted) speak("Rest!", config.voiceName, volume / 100);
                            setPhase(Phase.REST);
                            setCurrentCombo('REST!');
                            stopIntervals();
                            timerIntervalRef.current = window.setInterval(() => setTimeRemaining(t => t - 1), 1000);
                            return config.restDuration;
                        }
                     }
                    // End of Rest OR end of work with zero rest
                    setCurrentRound(r => r + 1);
                    setPhase(Phase.WORK);
                    if (!isMuted) playStartBell();
                    if (!isMuted) speak(`Round ${currentRound + 1}`, config.voiceName, volume / 100);
                    setCurrentCombo(`Round ${currentRound + 1}`);
                    setTimeout(() => {
                        comboLoop();
                        comboIntervalRef.current = window.setInterval(comboLoop, config.comboDurationMs);
                    }, 1000);
                    return config.roundDuration;
                }

                if (newTime <= 10 && newTime > 0) {
                     if (!isMuted) playWarningBeep();
                     if(newTime <= 3) {
                         if (!isMuted) speak(String(newTime), config.voiceName, volume/100);
                     } else if (newTime === 10) {
                         if (!isMuted) speak("10 seconds", config.voiceName, volume/100);
                     }
                }
                return newTime;
            });
        }, 1000);

        return stopIntervals;
    }, [workoutState, phase, currentRound, config, handleStop, comboLoop, isMuted, volume, playStartBell, playEndBell, playWarningBeep, speak, stopIntervals]);
    
    const handleStartPause = async () => {
        if (!isReady) {
            await initAudio();
        }
        
        if (workoutState === WorkoutState.IDLE || workoutState === WorkoutState.FINISHED) { // START
            setWorkoutState(WorkoutState.RUNNING);
            setPhase(Phase.WORK);
            setCurrentRound(1);
            setTimeRemaining(config.roundDuration);
            lastMoveSideRef.current = null;
            requestWakeLock();
            
            if (!isMuted) playStartBell();
            if (!isMuted) speak("Round 1. Fight!", config.voiceName, volume / 100);
            setCurrentCombo('Round 1');
            
            setTimeout(() => {
                comboLoop();
                comboIntervalRef.current = window.setInterval(comboLoop, config.comboDurationMs);
            }, 1000);

        } else if (workoutState === WorkoutState.PAUSED) { // RESUME
            setWorkoutState(WorkoutState.RUNNING);
            requestWakeLock();
            if (!isMuted) speak("Go!", config.voiceName, volume / 100);
            if(phase === Phase.WORK) {
                 setTimeout(() => {
                    comboLoop();
                    comboIntervalRef.current = window.setInterval(comboLoop, config.comboDurationMs);
                }, 500);
            }
        } else { // PAUSE
            setWorkoutState(WorkoutState.PAUSED);
            stopIntervals();
            releaseWakeLock();
            if (!isMuted) speak("Paused.", config.voiceName, volume / 100);
            setCurrentCombo('PAUSED');
        }
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullScreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullScreen(false));
        }
    };
    
    useEffect(() => {
        const handleF11 = (e: KeyboardEvent) => {
             if (e.key === 'F11' || (e.key === 'f' && document.activeElement?.tagName !== 'INPUT')) {
                    e.preventDefault();
                    toggleFullScreen();
                }
        }
        document.addEventListener('keydown', handleF11);
        return () => document.removeEventListener('keydown', handleF11);
    }, []);

    const workoutName = useMemo(() => {
        if(workoutState === WorkoutState.IDLE) return "A boxing training app";
        if(workoutState === WorkoutState.FINISHED) return "Workout Complete!";
        const phaseText = phase === Phase.WORK ? 'Work' : 'Rest';
        return `Round ${currentRound}/${config.numRounds} - ${phaseText}`;
    }, [workoutState, phase, currentRound, config.numRounds]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 font-sans">
            {showConfetti && <Confetti />}
            <div className="w-full max-w-sm sm:max-w-2xl bg-surface shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-700">
                <Header 
                    workoutName={workoutName}
                    isFullScreen={isFullScreen}
                    onToggleFullScreen={toggleFullScreen}
                />
                <ComboCallout combo={currentCombo} phase={phase} workoutState={workoutState} />
                <TimerDisplay 
                    timeRemaining={timeRemaining}
                    totalTimeRemaining={totalTimeRemaining}
                    phase={phase}
                />

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {(workoutState === WorkoutState.IDLE || workoutState === WorkoutState.PAUSED || workoutState === WorkoutState.FINISHED) && (
                        <Configuration 
                            config={config} 
                            onConfigChange={handleConfigChange}
                            volume={volume}
                            onVolumeChange={setVolume}
                            isMuted={isMuted}
                            onMuteToggle={handleMuteToggle}
                        />
                    )}
                </div>

                <div className="flex flex-col gap-4">
                     {(workoutState === WorkoutState.IDLE || workoutState === WorkoutState.FINISHED) && (
                         <button
                            onClick={() => setIsPreviewModalOpen(true)}
                            className="w-full bg-slate-600 hover:bg-slate-500 active:bg-slate-700 text-white font-semibold py-3 px-6 rounded-xl text-lg transition duration-150 ease-in-out shadow-md shadow-slate-800/50 flex items-center justify-center space-x-2 active:scale-[0.99]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            <span>Preview Combos</span>
                        </button>
                    )}
                    <Controls 
                        workoutState={workoutState}
                        onStartPause={handleStartPause}
                        onStop={() => setIsConfirmModalOpen(true)}
                    />
                </div>
            </div>

            <PreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                config={config}
                speak={speak}
                isMuted={isMuted}
                volume={volume}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={() => {
                    setIsConfirmModalOpen(false);
                    handleStop(false);
                }}
            />
        </div>
    );
};

export default App;
