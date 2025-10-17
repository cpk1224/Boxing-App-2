import React, { useMemo } from 'react';
import type { Config, GeminiVoice } from '../types';
import { COMBO_LENGTH_LABELS, COMBO_DIFFICULTY_LABELS, MOVE_COMPLEXITY_LABELS, INTENSITY_MAP } from '../constants';
import { Volume2, VolumeX } from 'lucide-react';

interface ConfigurationProps {
    config: Config;
    onConfigChange: (newConfig: Partial<Config>) => void;
    volume: number;
    onVolumeChange: (volume: number) => void;
    isMuted: boolean;
    onMuteToggle: () => void;
}

export const Configuration: React.FC<ConfigurationProps> = ({
    config,
    onConfigChange,
    volume,
    onVolumeChange,
    isMuted,
    onMuteToggle,
}) => {
    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onConfigChange({ [e.target.name]: parseInt(e.target.value) || 0 });
    };
    
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onConfigChange({ [e.target.name]: parseInt(e.target.value) });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'comboIntensity') {
            const newDuration = INTENSITY_MAP[value as keyof typeof INTENSITY_MAP];
            onConfigChange({ comboIntensity: value as Config['comboIntensity'], comboDurationMs: newDuration });
        } else if (name === 'voiceName') {
            onConfigChange({ voiceName: value as GeminiVoice });
        }
        else {
            onConfigChange({ [name]: value });
        }
    };
    
    const volumeDb = useMemo(() => {
        if (isMuted) return '-Inf';
        const vol = volume / 100;
        return vol === 0 ? '-Inf' : (20 * Math.log10(vol)).toFixed(1);
    }, [volume, isMuted]);
    
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value, 10);
        onVolumeChange(newVolume);
        if (newVolume > 0 && isMuted) {
            onMuteToggle();
        }
    };

    return (
        <div className="bg-slate-700 rounded-xl p-4 sm:p-6 space-y-6 shadow-xl opacity-100 transition-opacity duration-300">
            {/* Timer Settings */}
            <div className="space-y-3 border-b border-slate-600 pb-4">
                <h3 className="text-xl font-bold text-amber-400">Timer Settings</h3>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                     <div className="space-y-1">
                        <label htmlFor="roundDuration" className="text-xs font-semibold text-slate-300 block">Round Mins</label>
                        <input type="number" name="roundDuration" value={config.roundDuration/60} min="1" onChange={(e) => onConfigChange({roundDuration: (parseInt(e.target.value) || 1)*60})}
                            className="w-full bg-slate-800 text-white p-2 rounded-lg border-2 border-slate-600 focus:border-amber-500 transition duration-150 text-center"/>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="restDuration" className="text-xs font-semibold text-slate-300 block">Rest Mins</label>
                        <input type="number" name="restDuration" value={config.restDuration/60} min="0" onChange={(e) => onConfigChange({restDuration: (parseInt(e.target.value) || 0)*60})}
                            className="w-full bg-slate-800 text-white p-2 rounded-lg border-2 border-slate-600 focus:border-amber-500 transition duration-150 text-center"/>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="numRounds" className="text-xs font-semibold text-slate-300 block">Total Rounds</label>
                        <input type="number" name="numRounds" value={config.numRounds} min="1" onChange={handleNumericChange}
                            className="w-full bg-slate-800 text-white p-2 rounded-lg border-2 border-slate-600 focus:border-amber-500 transition duration-150 text-center"/>
                    </div>
                </div>
            </div>

            {/* Combo Logic Settings */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-amber-400">Combo Logic Settings</h3>
                <div className="space-y-2">
                    <label htmlFor="comboLength" className="text-sm font-semibold text-slate-300 block">1. Combo Length <span className="text-amber-300 ml-2 text-xs font-normal">{COMBO_LENGTH_LABELS[config.comboLength]}</span></label>
                    <input type="range" name="comboLength" min="0" max="2" value={config.comboLength} step="1" onChange={handleSliderChange} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    <div className="flex justify-between text-xs text-slate-400 pt-1"><span>Low</span><span>Medium</span><span>High</span></div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="comboDifficulty" className="text-sm font-semibold text-slate-300 block">2. Combo Difficulty <span className="text-amber-300 ml-2 text-xs font-normal">{COMBO_DIFFICULTY_LABELS[config.comboDifficulty]}</span></label>
                    <input type="range" name="comboDifficulty" min="0" max="2" value={config.comboDifficulty} step="1" onChange={handleSliderChange} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    <div className="flex justify-between text-xs text-slate-400 pt-1"><span>Low</span><span>Medium</span><span>High</span></div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="moveComplexity" className="text-sm font-semibold text-slate-300 block">3. Move Complexity <span className="text-amber-300 ml-2 text-xs font-normal">{MOVE_COMPLEXITY_LABELS[config.moveComplexity]}</span></label>
                    <input type="range" name="moveComplexity" min="0" max="2" value={config.moveComplexity} step="1" onChange={handleSliderChange} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    <div className="flex justify-between text-xs text-slate-400 pt-1"><span>Low</span><span>Medium</span><span>High</span></div>
                </div>
                
                {/* Selects */}
                <div className="space-y-1">
                    <label htmlFor="punchComplexity" className="text-sm font-semibold text-slate-300 block">4. Punch Variety</label>
                    <select name="punchComplexity" value={config.punchComplexity} onChange={handleSelectChange} className="w-full bg-slate-800 text-white p-3 rounded-lg border-2 border-slate-600 focus:border-amber-500 transition duration-150 pr-10 appearance-none">
                        <option value="Standard">Standard Punches (1-6) Only</option>
                        <option value="Body">Include Body Shots (1b-6b)</option>
                        <option value="Rare">Body Shots & Rare Punches</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label htmlFor="movesIncluded" className="text-sm font-semibold text-slate-300 block">5. Moves Included</label>
                    <select name="movesIncluded" value={config.movesIncluded} onChange={handleSelectChange} className="w-full bg-slate-800 text-white p-3 rounded-lg border-2 border-slate-600 focus:border-amber-500 transition duration-150 pr-10 appearance-none">
                        <option value="PunchesOnly">Punches Only</option>
                        <option value="PunchesAndDefense">Punches & Defensive Moves</option>
                        <option value="All">Punches, Defense, & Footwork</option>
                    </select>
                </div>
                 <div className="space-y-1">
                    <label htmlFor="comboIntensity" className="text-sm font-semibold text-slate-300 block">6. Combo Intensity</label>
                    <select name="comboIntensity" value={config.comboIntensity} onChange={handleSelectChange} className="w-full bg-slate-800 text-white p-3 rounded-lg border-2 border-slate-600 focus:border-amber-500 transition duration-150 pr-10 appearance-none">
                        <option value="Low">Low (Slower Pace - 4s)</option>
                        <option value="Medium">Medium (Standard Pace - 2.5s)</option>
                        <option value="High">High (Fast Pace - 1.5s)</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label htmlFor="trainingMode" className="text-sm font-semibold text-slate-300 block">7. Training Mode</label>
                    <select name="trainingMode" value={config.trainingMode} onChange={handleSelectChange} className="w-full bg-slate-800 text-white p-3 rounded-lg border-2 border-slate-600 focus:border-amber-500 transition duration-150 pr-10 appearance-none">
                        <option value="Shadowboxing">Shadowboxing (Flow & Movement)</option>
                        <option value="HeavyBag">Heavy Bag (Power & Fixed Target)</option>
                    </select>
                </div>
            </div>

            {/* Voice and Sound Controls */}
            <div className="flex space-x-4 pt-4 border-t border-slate-600">
                <div className="space-y-1 w-2/3">
                    <label htmlFor="voiceName" className="text-sm font-semibold text-slate-300 block">Voice Announcer</label>
                    <select name="voiceName" value={config.voiceName} onChange={handleSelectChange} className="w-full bg-slate-800 text-white p-3 rounded-lg border-2 border-slate-600 focus:border-amber-500 transition duration-150 pr-10 appearance-none">
                        <option value="Kore">Kore (Firm)</option>
                        <option value="Puck">Puck (Upbeat)</option>
                        <option value="Charon">Charon (Informative)</option>
                        <option value="Zephyr">Zephyr (Bright)</option>
                    </select>
                </div>
                <div className="space-y-1 w-1/3">
                    <label className="text-sm font-semibold text-slate-300 block">Volume</label>
                    <div className="flex items-center space-x-2">
                        <button onClick={onMuteToggle} className="flex-shrink-0 p-2 bg-slate-800 hover:bg-slate-600 text-white rounded-lg border-2 border-slate-600 transition duration-150">
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer" />
                        <span className="text-xs text-amber-400 w-10 text-right font-mono">{volumeDb} dB</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
