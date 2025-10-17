import { useState, useRef, useCallback } from 'react';
import type { GeminiVoice } from '../types';

declare const Tone: any; // Using Tone.js from CDN

export const useTTS = () => {
    const [isReady, setIsReady] = useState(false);
    const gainNodeRef = useRef<any>(null);
    const currentAudioSourceRef = useRef<any>(null);

    const initAudio = useCallback(async () => {
        if (isReady) return;
        try {
            await Tone.start();
            gainNodeRef.current = new Tone.Gain(0.75).toDestination();
            setIsReady(true);
            console.log('Audio Context Initialized.');
        } catch (error) {
            console.error("Error initializing audio context:", error);
        }
    }, [isReady]);
    
    const base64ToWavBlob = (base64String: string, sampleRate: number): Blob => {
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const pcm16 = new Int16Array(byteArray.buffer);
        
        const buffer = new ArrayBuffer(44 + pcm16.length * 2);
        const view = new DataView(buffer);
        let offset = 0;

        const writeString = (str: string) => {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
            offset += str.length;
        };

        writeString('RIFF');
        view.setUint32(offset, 36 + pcm16.length * 2, true); offset += 4; 
        writeString('WAVE');
        writeString('fmt ');
        view.setUint32(offset, 16, true); offset += 4;
        view.setUint16(offset, 1, true); offset += 2;  
        view.setUint16(offset, 1, true); offset += 2;  
        view.setUint32(offset, sampleRate, true); offset += 4; 
        view.setUint32(offset, sampleRate * 2, true); offset += 4; 
        view.setUint16(offset, 2, true); offset += 2;  
        view.setUint16(offset, 16, true); offset += 2; 
        writeString('data');
        view.setUint32(offset, pcm16.length * 2, true); offset += 4;

        for (let i = 0; i < pcm16.length; i++) {
            view.setInt16(offset, pcm16[i], true); offset += 2;
        }

        return new Blob([view], { type: 'audio/wav' });
    };

    const speak = useCallback(async (text: string, voiceName: GeminiVoice, volume: number) => {
        if (!isReady || !gainNodeRef.current) {
            console.warn('Audio not ready, skipping speech.');
            return;
        }

        gainNodeRef.current.gain.value = volume;

        if (currentAudioSourceRef.current) {
            try { currentAudioSourceRef.current.stop(); } catch (e) {}
            currentAudioSourceRef.current = null;
        }
        
        const ai = new (window as any).GoogleGenAI({ apiKey: process.env.API_KEY });

        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash-preview-tts",
                    contents: [{ parts: [{ text: `Say with enthusiasm: ${text}` }] }],
                    config: {
                      responseModalities: ['AUDIO'],
                      speechConfig: {
                          voiceConfig: {
                            prebuiltVoiceConfig: { voiceName }
                          }
                      }
                    }
                });

                const audioPart = response.candidates?.[0]?.content?.parts?.find(
                    (p: any) => p.inlineData && p.inlineData.mimeType.startsWith("audio/L16")
                );

                if (audioPart) {
                    const audioData = audioPart.inlineData.data;
                    const mimeType = audioPart.inlineData.mimeType;
                    const rateMatch = mimeType.match(/rate=(\d+)/);
                    if (rateMatch && rateMatch[1]) {
                        const sampleRate = parseInt(rateMatch[1], 10);
                        const wavBlob = base64ToWavBlob(audioData, sampleRate);
                        const reader = new FileReader();
                        
                        reader.onload = async (e) => {
                             if (e.target?.result instanceof ArrayBuffer) {
                                const audioContext = Tone.getContext().rawContext;
                                const audioBuffer = await audioContext.decodeAudioData(e.target.result);
                                const source = audioContext.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(gainNodeRef.current.context.rawContext.createGain());
                                source.connect(gainNodeRef.current);
                                source.start(0);
                                currentAudioSourceRef.current = source;
                                source.onended = () => {
                                    if (currentAudioSourceRef.current === source) {
                                        currentAudioSourceRef.current = null;
                                    }
                                };
                            }
                        };
                        reader.readAsArrayBuffer(wavBlob);
                        return; // Success
                    }
                }
                throw new Error("Invalid TTS response structure.");
            } catch (error) {
                console.error(`TTS API call failed (Attempt ${retries + 1}):`, error);
                retries++;
                if (retries < maxRetries) {
                    await new Promise(res => setTimeout(res, 1000 * Math.pow(2, retries)));
                } else {
                     console.error("Max retries reached for TTS.");
                }
            }
        }
    }, [isReady]);

    return { speak, isReady, initAudio };
};
