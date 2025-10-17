import { useRef, useCallback } from 'react';
declare const Tone: any;

export const useSounds = () => {
    const synthRef = useRef<any>(null);

    const initSynth = useCallback(() => {
        if (!synthRef.current && typeof Tone !== 'undefined') {
            synthRef.current = new Tone.Synth({
                oscillator: { type: 'sine' },
                envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
            }).toDestination();
            synthRef.current.volume.value = -12;
        }
    }, []);

    const playStartBell = useCallback(() => {
        initSynth();
        if (!synthRef.current) return;
        const now = Tone.now();
        synthRef.current.triggerAttackRelease("C5", "8n", now);
        synthRef.current.triggerAttackRelease("E5", "8n", now + 0.2);
        synthRef.current.triggerAttackRelease("G5", "8n", now + 0.4);
    }, [initSynth]);

    const playEndBell = useCallback(() => {
        initSynth();
        if (!synthRef.current) return;
        synthRef.current.triggerAttackRelease("C4", "1n", Tone.now(), 0.5);
    }, [initSynth]);

    const playWarningBeep = useCallback(() => {
        initSynth();
        if (!synthRef.current) return;
        synthRef.current.triggerAttackRelease("A4", "32n", Tone.now());
    }, [initSynth]);

    return { playStartBell, playEndBell, playWarningBeep };
};
