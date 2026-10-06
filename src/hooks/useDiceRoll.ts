import {useCallback, useEffect, useRef, useState} from 'react';
import {rollDice, type DicePair} from '../utils/dice';

const ROLL_DURATION = 600;
const FACE_FLICKER_INTERVAL = 70;
export const HISTORY_SIZE = 6;

const useDiceRoll = () => {
    // null = no current roll: blank dice, nothing highlighted
    const [dice, setDice] = useState<DicePair | null>(null);
    const [rolling, setRolling] = useState(false);
    const [history, setHistory] = useState<{id: number, dice: DicePair}[]>([]);
    const nextId = useRef(0);

    useEffect(() => {
        if (!rolling) return;
        const flicker = setInterval(() => setDice(rollDice()), FACE_FLICKER_INTERVAL);
        const stop = setTimeout(() => {
            const entry = {id: nextId.current++, dice: rollDice()};
            setDice(entry.dice);
            // keep the updater pure: StrictMode may call it twice
            setHistory(prev => [entry, ...prev].slice(0, HISTORY_SIZE));
            setRolling(false);
        }, ROLL_DURATION);
        return () => {
            clearInterval(flicker);
            clearTimeout(stop);
        };
    }, [rolling]);

    const roll = useCallback(() => setRolling(true), []);
    const clear = useCallback(() => setDice(null), []);

    return {dice, rolling, history, roll, clear};
};

export default useDiceRoll;
