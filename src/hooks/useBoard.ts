import {useEffect, useState} from 'react';
import {generateBoard, isValidBoard, type Tile} from '../utils/board';
import type {PlayerMode} from '../utils/constants';

const STORAGE_KEY = 'catanel:board';

const loadBoard = (mode: PlayerMode): Tile[] => {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
        if (stored?.mode === mode && isValidBoard(mode, stored.tiles)) return stored.tiles;
    } catch {
        // unreadable storage — fall through to a fresh board
    }
    return generateBoard(mode);
};

const useBoard = (mode: PlayerMode) => {
    const [board, setBoard] = useState(() => ({mode, tiles: loadBoard(mode)}));

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
        } catch {
            // storage unavailable — the board just won't survive a reload
        }
    }, [board]);

    const regenerate = (nextMode: PlayerMode) => setBoard({mode: nextMode, tiles: generateBoard(nextMode)});

    return {tiles: board.tiles, regenerate};
};

export default useBoard;
