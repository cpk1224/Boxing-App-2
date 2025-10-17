import { useState, useRef, useEffect, useCallback } from 'react';

export const useWakeLock = () => {
    const [isSupported, setIsSupported] = useState(false);
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    useEffect(() => {
        setIsSupported('wakeLock' in navigator);
    }, []);
    
    const request = useCallback(async () => {
        if (!isSupported || wakeLockRef.current) return;
        try {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
            console.log('Screen Wake Lock acquired.');
            wakeLockRef.current.addEventListener('release', () => {
                console.log('Screen Wake Lock released.');
                wakeLockRef.current = null;
            });
        } catch (err: any) {
            console.error(`Wake Lock request failed: ${err.name}, ${err.message}`);
        }
    }, [isSupported]);
    
    const release = useCallback(async () => {
        if (!wakeLockRef.current) return;
        try {
            await wakeLockRef.current.release();
            wakeLockRef.current = null;
        } catch (err: any) {
            console.error(`Wake Lock release failed: ${err.name}, ${err.message}`);
        }
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
                request();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            release();
        };
    }, [request, release]);

    return { request, release };
};
