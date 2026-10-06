import shuffle from './shuffle';
import {BOARD_CONFIGS, HOT_NUMBERS, type PlayerMode, type ResourceType} from './constants';

export interface Tile {
    id: number;
    y: number;
    // doubled column: neighbours in the same row are ±2, in adjacent rows ±1
    col: number;
    resource: ResourceType;
    number: number | null;
    robber: boolean;
}

const MAX_ATTEMPTS = 2000;

const slotsFor = (rows: number[]) => {
    const widest = Math.max(...rows);
    return rows.flatMap((length, y) =>
        Array.from({length}, (_, i) => ({y, col: widest - length + 2 * i}))
    );
};

export const areNeighbours = (a: Tile, b: Tile): boolean => {
    const dy = Math.abs(a.y - b.y);
    const dc = Math.abs(a.col - b.col);
    return (dy === 0 && dc === 2) || (dy === 1 && dc === 1);
};

export const hasAdjacentHotNumbers = (tiles: Tile[]): boolean => {
    const hot = tiles.filter(t => t.number !== null && HOT_NUMBERS.includes(t.number));
    return hot.some((a, i) => hot.slice(i + 1).some(b => areNeighbours(a, b)));
};

const placeNumbers = (mode: PlayerMode, resources: ResourceType[]): Tile[] => {
    const numbers = shuffle(BOARD_CONFIGS[mode].numbers);
    const robberAt = resources.indexOf('empty');
    return slotsFor(BOARD_CONFIGS[mode].rows).map((slot, id) => ({
        ...slot,
        id,
        resource: resources[id],
        number: resources[id] === 'empty' ? null : numbers.pop() ?? null,
        robber: id === robberAt,
    }));
};

export const generateBoard = (mode: PlayerMode): Tile[] => {
    const resources = shuffle(BOARD_CONFIGS[mode].resources);
    let tiles = placeNumbers(mode, resources);
    for (let i = 0; i < MAX_ATTEMPTS && hasAdjacentHotNumbers(tiles); i++) {
        tiles = placeNumbers(mode, resources);
    }
    return tiles;
};

const sortedKey = (values: unknown[]): string => JSON.stringify([...values].map(String).sort());

// Guards boards read from storage: same tile set, tokens and slots as a freshly generated one
export const isValidBoard = (mode: PlayerMode, tiles: unknown): tiles is Tile[] => {
    if (!Array.isArray(tiles)) return false;
    const {rows, resources, numbers} = BOARD_CONFIGS[mode];
    const slots = slotsFor(rows);
    return tiles.length === slots.length
        && tiles.every((tile, id) => tile?.id === id
            && tile.y === slots[id].y
            && tile.col === slots[id].col
            && typeof tile.robber === 'boolean'
            && (tile.number === null) === (tile.resource === 'empty'))
        && tiles.filter(tile => tile.robber).length === 1
        && sortedKey(tiles.map(tile => tile.resource)) === sortedKey(resources)
        && sortedKey(tiles.flatMap(tile => tile.number ?? [])) === sortedKey(numbers);
};
