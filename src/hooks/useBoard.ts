import {useEffect, useState} from 'react';
import {followsRules, generateBoard, isValidBoard, type Tile} from '../utils/board';
import type {BalanceMode, PlayerMode} from '../utils/constants';

const STORAGE_KEY = 'catanel:board';

interface BoardOptions {
    mode: PlayerMode;
    balance: BalanceMode;
}

const loadBoard = ({mode, balance}: BoardOptions): Tile[] => {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
        if (
            stored?.mode === mode
            && stored.balance === balance
            && isValidBoard(mode, stored.tiles)
            && followsRules(stored.tiles, balance)
        ) return stored.tiles;
    } catch {
        // unreadable storage — fall through to a fresh board
    }
    return generateBoard(mode, balance);
};

const useBoard = (options: BoardOptions) => {
    const [board, setBoard] = useState(() => ({...options, tiles: loadBoard(options)}));

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
        } catch {
            // storage unavailable — the board just won't survive a reload
        }
    }, [board]);

    const regenerate = ({mode, balance}: BoardOptions) => setBoard({mode, balance, tiles: generateBoard(mode, balance)});

    return {tiles: board.tiles, regenerate};
};

export default useBoard;
