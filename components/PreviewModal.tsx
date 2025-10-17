import React, { useState, useEffect } from 'react';
import { X, Volume2, ClipboardList } from 'lucide-react';
import { generateCombo } from '../services/comboGenerator';
import type { Config, GeminiVoice } from '../types';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: Config;
    speak: (text: string, voice: GeminiVoice, volume: number) => void;
    isMuted: boolean;
    volume: number;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, config, speak, isMuted, volume }) => {
    const [sampleCombos, setSampleCombos] = useState<string[][]>([]);

    useEffect(() => {
        if (isOpen) {
            const combos: string[][] = [];
            let lastSide: string | null = null;
            for (let i = 0; i < 10; i++) {
                const result = generateCombo(config, lastSide);
                combos.push(result.combo);
                lastSide = result.lastSide;
            }
            setSampleCombos(combos);
        }
    }, [isOpen, config]);

    if (!isOpen) return null;

    const handleSpeak = (combo: string[]) => {
        if (!isMuted) {
            speak(combo.join(' '), config.voiceName, volume / 100);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-slate-700 transform transition duration-300 scale-100 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl font-extrabold text-white flex items-center space-x-2">
                        <ClipboardList className="w-6 h-6 text-amber-400" />
                        <span>Workout Preview</span>
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <div id="preview-metadata" className="mb-4 text-sm font-semibold border-b border-slate-700 pb-3 text-slate-300">
                    <p><strong>Pace:</strong> {config.comboIntensity} ({config.comboDurationMs / 1000}s/combo)</p>
                     <p><strong>Variety:</strong> {config.punchComplexity} & {config.movesIncluded}</p>
                </div>

                <div id="preview-content" className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {sampleCombos.map((combo, index) => (
                        <div key={index} className="p-3 bg-slate-700 rounded-lg flex justify-between items-center shadow-md">
                            <span className="text-slate-400 font-mono w-8">{index + 1}.</span>
                            <span className="text-white text-xl font-extrabold flex-grow text-center tracking-wider">{combo.join(' ')}</span>
                            <button onClick={() => handleSpeak(combo)} className="text-amber-400 hover:text-amber-300 transition active:scale-95 p-1 rounded-full">
                                <Volume2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition uppercase shadow-md">Close</button>
                </div>
            </div>
        </div>
    );
};
