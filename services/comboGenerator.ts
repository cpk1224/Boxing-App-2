import { MOVES } from '../constants';
import type { Config } from '../types';

export const generateCombo = (config: Config, lastSide: string | null) => {
    const { comboLength: lengthLevel, comboDifficulty: difficultyLevel, moveComplexity: complexityLevel, punchComplexity, movesIncluded } = config;

    const comboLength = [1, 4, 6][lengthLevel] + Math.floor(Math.random() * [1, 2, 3][lengthLevel]);
    let combo: string[] = [];

    const availableMoves = Object.keys(MOVES).filter(key => {
        const move = MOVES[key];
        if (punchComplexity === 'Standard' && move.group === 'Punch' && (move.body || key === 'O' || key === 'E')) return false;
        if (punchComplexity === 'Body' && (key === 'O' || key === 'E')) return false;
        if (movesIncluded === 'PunchesOnly' && move.group !== 'Punch') return false;
        if (movesIncluded === 'PunchesAndDefense' && move.group === 'Footwork') return false;
        return true;
    });

    let currentLastMoveSide = lastSide;

    for (let i = 0; i < combo.length || i < comboLength; i++) {
        let potentialMoves = [...availableMoves];

        // Filter based on difficulty (same-side punches)
        if (i > 0 && currentLastMoveSide && difficultyLevel < 2) {
             potentialMoves = potentialMoves.filter(key => {
                const move = MOVES[key];
                if (move.group !== 'Punch') return true;
                if (move.side !== currentLastMoveSide) return true;
                if (difficultyLevel === 0) return false;
                if (difficultyLevel === 1) return Math.random() < 0.3; // 30% chance for same-side
                return true;
            });
        }
        
        // Filter based on complexity (non-punch moves)
        if (complexityLevel < 2) {
             potentialMoves = potentialMoves.filter(key => {
                const move = MOVES[key];
                if (move.group === 'Punch') return true;
                if (complexityLevel === 0) return false;
                if (complexityLevel === 1) return Math.random() < 0.2; // 20% chance for non-punch
                return true;
            });
        }

        if (potentialMoves.length === 0) { // Fallback if filters are too restrictive
            potentialMoves = availableMoves.filter(k => MOVES[k].group === 'Punch');
        }

        const totalWeight = potentialMoves.reduce((sum, key) => sum + (MOVES[key]?.common || 1), 0);
        let randomWeight = Math.random() * totalWeight;
        let nextMoveKey: string | null = null;

        for (const key of potentialMoves) {
            randomWeight -= (MOVES[key]?.common || 1);
            if (randomWeight < 0) {
                nextMoveKey = key;
                break;
            }
        }
        
        if (nextMoveKey) {
            combo.push(nextMoveKey);
            const nextMove = MOVES[nextMoveKey];
            if (nextMove.side === 'L' || nextMove.side === 'R') {
                currentLastMoveSide = nextMove.side;
            }
        } else if (potentialMoves.length > 0) { // Fallback if weighted random fails
             const fallbackKey = potentialMoves[Math.floor(Math.random() * potentialMoves.length)];
             combo.push(fallbackKey);
             const fallbackMove = MOVES[fallbackKey];
             if (fallbackMove.side === 'L' || fallbackMove.side === 'R') {
                 currentLastMoveSide = fallbackMove.side;
             }
        }
    }
    
    return { combo, lastSide: currentLastMoveSide };
};
