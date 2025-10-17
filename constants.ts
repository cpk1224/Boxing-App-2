import type { MoveDefinition, Config, GeminiVoice } from './types';

export const MOVES: Record<string, MoveDefinition> = {
    '1': { text: '1', side: 'L', group: 'Punch', body: false, head: true, common: 10 }, 
    '2': { text: '2', side: 'R', group: 'Punch', body: false, head: true, common: 10 },
    '3': { text: '3', side: 'L', group: 'Punch', body: false, head: true, common: 8 },
    '4': { text: '4', side: 'R', group: 'Punch', body: false, head: true, common: 8 },
    '5': { text: '5', side: 'L', group: 'Punch', body: false, head: true, common: 7 },
    '6': { text: '6', side: 'R', group: 'Punch', body: false, head: true, common: 7 },
    '1b': { text: '1 body', side: 'L', group: 'Punch', body: true, head: false, common: 5 },
    '2b': { text: '2 body', side: 'R', group: 'Punch', body: true, head: false, common: 5 },
    '3b': { text: '3 body', side: 'L', group: 'Punch', body: true, head: false, common: 4 },
    '4b': { text: '4 body', side: 'R', group: 'Punch', body: true, head: false, common: 4 },
    '5b': { text: '5 body', side: 'L', group: 'Punch', body: true, head: false, common: 3 },
    '6b': { text: '6 body', side: 'R', group: 'Punch', body: true, head: false, common: 3 },
    'O': { text: 'Overhand', side: 'R', group: 'Punch', body: false, head: true, common: 2 },
    'E': { text: 'Elbow', side: 'R', group: 'Punch', body: false, head: true, common: 1 },
    'S': { text: 'Slip', side: 'D', group: 'Defense', common: 5 },
    'R': { text: 'Roll', side: 'D', group: 'Defense', common: 4 },
    'P': { text: 'Parry', side: 'D', group: 'Defense', common: 3 },
    'B': { text: 'Block', side: 'D', group: 'Defense', common: 3 },
    'A': { text: 'Angle', side: 'F', group: 'Footwork', common: 4 },
    'F': { text: 'Feint', side: 'F', group: 'Footwork', common: 3 },
    'L': { text: 'L Step', side: 'F', group: 'Footwork', common: 2 },
};

export const INITIAL_CONFIG: Config = {
    roundDuration: 3 * 60,
    restDuration: 1 * 60,
    numRounds: 5,
    comboLength: 1, // Medium
    comboDifficulty: 1, // Medium
    moveComplexity: 1, // Medium
    punchComplexity: 'Body',
    movesIncluded: 'All',
    comboIntensity: 'Medium',
    comboDurationMs: 2500,
    trainingMode: 'Shadowboxing',
    voiceName: 'Kore' as GeminiVoice,
};

export const COMBO_LENGTH_LABELS = ['Low (1-3 Punches)', 'Medium (1-4 Punches)', 'High (2-6 Punches)'];
export const COMBO_DIFFICULTY_LABELS = ['Low (Alternating Sides)', 'Medium (Some Same-Side)', 'High (Frequent Same-Side)'];
export const MOVE_COMPLEXITY_LABELS = ['Low (Punches Only)', 'Medium (Occasional Non-Punches)', 'High (Frequent Non-Punches)'];
export const INTENSITY_MAP: { [key in 'Low' | 'Medium' | 'High']: number } = { 'Low': 4000, 'Medium': 2500, 'High': 1500 };
