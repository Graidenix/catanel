import {useCallback, useEffect, useRef, useState} from 'react';
import {rollDice, type DicePair} from '../utils/dice';

const ROLL_DURATION = 600;
const FACE_FLICKER_INTERVAL = 70;
export const HISTORY_SIZE = 6;

const useDiceRoll = () => {
    const [dice, setDice] = useState<DicePair>(rollDice);
    const [rolling, setRolling] = useState(false);
    const [history, setHistory] = useState<{id: number, dice: DicePair}[]>([]);
    const nextId = useRef(0);

    useEffect(() => {
        if (!rolling) return;
        const flicker = setInterval(() => setDice(rollDice()), FACE_FLICKER_INTERVAL);
        const stop = setTimeout(() => {
            const final = rollDice();
            setDice(final);
            setHistory(prev => [{id: nextId.current++, dice: final}, ...prev].slice(0, HISTORY_SIZE));
            setRolling(false);
        }, ROLL_DURATION);
        return () => {
            clearInterval(flicker);
            clearTimeout(stop);
        };
    }, [rolling]);

    const roll = useCallback(() => setRolling(true), []);

    return {dice, rolling, history, roll};
};

export default useDiceRoll;
