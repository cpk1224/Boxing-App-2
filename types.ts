export interface MoveDefinition {
    text: string;
    side: 'L' | 'R' | 'D' | 'F' | 'C';
    group: 'Punch' | 'Defense' | 'Footwork' | 'Command';
    body?: boolean;
    head?: boolean;
    common: number;
}

export type GeminiVoice = 'Kore' | 'Puck' | 'Charon' | 'Zephyr';

export interface Config {
    roundDuration: number;
    restDuration: number;
    numRounds: number;
    comboLength: number;
    comboDifficulty: number;
    moveComplexity: number;
    punchComplexity: 'Standard' | 'Body' | 'Rare';
    movesIncluded: 'PunchesOnly' | 'PunchesAndDefense' | 'All';
    comboIntensity: 'Low' | 'Medium' | 'High';
    comboDurationMs: number;
    trainingMode: 'Shadowboxing' | 'HeavyBag';
    voiceName: GeminiVoice;
}

export enum WorkoutState {
    IDLE = 'IDLE',
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    FINISHED = 'FINISHED',
}

export enum Phase {
    WORK = 'WORK',
    REST = 'REST',
}
