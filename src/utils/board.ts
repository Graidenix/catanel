import shuffle from './shuffle';
import {BOARD_CONFIGS, HOT_NUMBERS, type BalanceMode, type PlayerMode, type ResourceType} from './constants';

export interface Tile {
    id: number;
    y: number;
    // doubled column: neighbours in the same row are ±2, in adjacent rows ±1
    col: number;
    resource: ResourceType;
    number: number | null;
    robber: boolean;
}

// Plain random tries before falling back to a search that always finds a valid layout
const MAX_ATTEMPTS = 2000;
// Balanced mode: whole-board tries while looking for an even spread of good numbers
const MAX_BALANCED_ATTEMPTS = 400;
const MAX_RESOURCE_SHUFFLES = 2000;
// Step budget for one bounded search; the last-resort search runs without one
const MAX_SEARCH_STEPS = 20000;
// Largest allowed group of touching tiles with the same resource
export const MAX_RESOURCE_CLUSTER = 2;
// Largest allowed gap between the best- and worst-numbered resource, in average dots per tile
export const MAX_PIP_SPREAD = 1;

const slotsFor = (rows: number[]) => {
    const widest = Math.max(...rows);
    return rows.flatMap((length, y) =>
        Array.from({length}, (_, i) => ({y, col: widest - length + 2 * i}))
    );
};

export const areNeighbours = (a: {y: number, col: number}, b: {y: number, col: number}): boolean => {
    const dy = Math.abs(a.y - b.y);
    const dc = Math.abs(a.col - b.col);
    return (dy === 0 && dc === 2) || (dy === 1 && dc === 1);
};

const neighbourIndex = (slots: {y: number, col: number}[]): number[][] =>
    slots.map(a => slots.flatMap((b, j) => (areNeighbours(a, b) ? [j] : [])));

// Dots under a token: how many of the 36 dice combinations produce the number
export const pipCount = (n: number | null): number => (n === null ? 0 : 6 - Math.abs(7 - n));

const RARE_NUMBERS = [2, 12];

const isHot = (n: number): boolean => HOT_NUMBERS.includes(n);

// Numbers that must not sit on touching tiles in balanced mode
const numbersClash = (a: number, b: number): boolean =>
    a === b || (isHot(a) && isHot(b)) || (RARE_NUMBERS.includes(a) && RARE_NUMBERS.includes(b));

export const hasAdjacentHotNumbers = (tiles: Tile[]): boolean => {
    const hot = tiles.filter(t => t.number !== null && isHot(t.number));
    return hot.some((a, i) => hot.slice(i + 1).some(b => areNeighbours(a, b)));
};

export const hasClashingNumbers = (tiles: Tile[]): boolean =>
    tiles.some((a, i) => a.number !== null && tiles.slice(i + 1).some(b =>
        b.number !== null && areNeighbours(a, b) && numbersClash(a.number!, b.number)
    ));

// Size of the largest group of touching tiles that share a resource (desert ignored)
export const largestResourceCluster = (resources: ResourceType[], neighbours: number[][]): number => {
    const seen = new Set<number>();
    let largest = 0;
    resources.forEach((resource, start) => {
        if (resource === 'empty' || seen.has(start)) return;
        const stack = [start];
        let size = 0;
        seen.add(start);
        while (stack.length) {
            const current = stack.pop()!;
            size++;
            neighbours[current].forEach(next => {
                if (!seen.has(next) && resources[next] === resource) {
                    seen.add(next);
                    stack.push(next);
                }
            });
        }
        largest = Math.max(largest, size);
    });
    return largest;
};

// Gap between the resource with the best and the worst average dots per tile
export const pipSpread = (tiles: Tile[]): number => {
    const byResource = new Map<ResourceType, number[]>();
    tiles.forEach(({resource, number}) => {
        if (resource !== 'empty') byResource.set(resource, [...byResource.get(resource) ?? [], pipCount(number)]);
    });
    const averages = [...byResource.values()].map(dots => dots.reduce((a, b) => a + b, 0) / dots.length);
    return Math.max(...averages) - Math.min(...averages);
};

const buildTiles = (mode: PlayerMode, resources: ResourceType[], numbers: (number | null)[]): Tile[] => {
    const robberAt = resources.indexOf('empty');
    return slotsFor(BOARD_CONFIGS[mode].rows).map((slot, id) => ({
        ...slot,
        id,
        resource: resources[id],
        number: numbers[id],
        robber: id === robberAt,
    }));
};

const placeNumbersRandomly = (mode: PlayerMode, resources: ResourceType[]): (number | null)[] => {
    const numbers = shuffle(BOARD_CONFIGS[mode].numbers);
    return resources.map(resource => (resource === 'empty' ? null : numbers.pop() ?? null));
};

/**
 * Depth-first search that fills `slots` from the `pool` multiset so every placement `fits`.
 * Candidate order is shuffled, so results stay random. Returns null when the step budget runs out
 * or, with an unlimited budget, when no valid assignment exists.
 */
const searchAssignment = <T>(
    size: number,
    slots: number[],
    pool: T[],
    fits: (slot: number, value: T, assigned: (T | null)[]) => boolean,
    maxSteps = Infinity,
): (T | null)[] | null => {
    const remaining = new Map<T, number>();
    pool.forEach(value => remaining.set(value, (remaining.get(value) ?? 0) + 1));
    const assigned: (T | null)[] = Array(size).fill(null);
    let steps = 0;

    const place = (index: number): boolean => {
        if (index === slots.length) return true;
        if (++steps > maxSteps) return false;
        const slot = slots[index];
        for (const value of shuffle([...remaining.keys()].filter(v => remaining.get(v)! > 0))) {
            if (!fits(slot, value, assigned)) continue;
            assigned[slot] = value;
            remaining.set(value, remaining.get(value)! - 1);
            if (place(index + 1)) return true;
            remaining.set(value, remaining.get(value)! + 1);
            assigned[slot] = null;
        }
        return false;
    };

    return place(0) ? assigned : null;
};

const searchNumbers = (
    mode: PlayerMode,
    resources: ResourceType[],
    neighbours: number[][],
    clash: (a: number, b: number) => boolean,
    maxSteps?: number,
): (number | null)[] | null => searchAssignment<number>(
    resources.length,
    resources.flatMap((resource, id) => (resource === 'empty' ? [] : [id])),
    BOARD_CONFIGS[mode].numbers,
    (slot, n, placed) => !neighbours[slot].some(other => placed[other] !== null && clash(n, placed[other]!)),
    maxSteps,
);

// Size of the same-resource group `slot` would join, counting only tiles placed so far
const groupSizeWith = (slot: number, resource: ResourceType, placed: (ResourceType | null)[], neighbours: number[][]): number => {
    const seen = new Set([slot]);
    const stack = [slot];
    while (stack.length) {
        neighbours[stack.pop()!].forEach(next => {
            if (!seen.has(next) && placed[next] === resource) {
                seen.add(next);
                stack.push(next);
            }
        });
    }
    return seen.size;
};

const resourcesWithoutClusters = (mode: PlayerMode, neighbours: number[][]): ResourceType[] => {
    const pool = BOARD_CONFIGS[mode].resources;
    for (let i = 0; i < MAX_RESOURCE_SHUFFLES; i++) {
        const resources = shuffle(pool);
        if (largestResourceCluster(resources, neighbours) <= MAX_RESOURCE_CLUSTER) return resources;
    }
    const searched = searchAssignment<ResourceType>(
        pool.length,
        pool.map((_, id) => id),
        pool,
        (slot, resource, placed) =>
            resource === 'empty' || groupSizeWith(slot, resource, placed, neighbours) <= MAX_RESOURCE_CLUSTER,
    );
    if (!searched) throw new Error('No resource layout without clusters exists for this board');
    return searched as ResourceType[];
};

const hotClash = (a: number, b: number): boolean => isHot(a) && isHot(b);

const generateRandomBoard = (mode: PlayerMode): Tile[] => {
    const neighbours = neighbourIndex(slotsFor(BOARD_CONFIGS[mode].rows));
    const resources = shuffle(BOARD_CONFIGS[mode].resources);
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const tiles = buildTiles(mode, resources, placeNumbersRandomly(mode, resources));
        if (!hasAdjacentHotNumbers(tiles)) return tiles;
    }
    // Retries exhausted (only plausible with a broken random source): search for a valid layout instead
    const numbers = searchNumbers(mode, resources, neighbours, hotClash);
    if (!numbers) throw new Error('No layout keeps 6 and 8 apart for this board');
    return buildTiles(mode, resources, numbers);
};

// Every candidate already satisfies the clash and cluster rules; retries only chase an even pip spread,
// keeping the most even board if none gets within MAX_PIP_SPREAD
const generateBalancedBoard = (mode: PlayerMode): Tile[] => {
    const neighbours = neighbourIndex(slotsFor(BOARD_CONFIGS[mode].rows));
    let best: {tiles: Tile[], spread: number} | null = null;
    for (let i = 0; i < MAX_BALANCED_ATTEMPTS; i++) {
        const resources = resourcesWithoutClusters(mode, neighbours);
        const numbers = searchNumbers(mode, resources, neighbours, numbersClash, MAX_SEARCH_STEPS);
        if (!numbers) continue;
        const tiles = buildTiles(mode, resources, numbers);
        const spread = pipSpread(tiles);
        if (spread <= MAX_PIP_SPREAD) return tiles;
        if (!best || spread < best.spread) best = {tiles, spread};
    }
    if (best) return best.tiles;
    // Every bounded search ran out of steps: one complete search always finds a layout if any exists
    const resources = resourcesWithoutClusters(mode, neighbours);
    const numbers = searchNumbers(mode, resources, neighbours, numbersClash);
    if (!numbers) throw new Error('No balanced number layout exists for this board');
    return buildTiles(mode, resources, numbers);
};

export const generateBoard = (mode: PlayerMode, balance: BalanceMode = 'balanced'): Tile[] =>
    balance === 'balanced' ? generateBalancedBoard(mode) : generateRandomBoard(mode);

// Rules every board of this balance must satisfy; used to vet boards restored from storage
export const followsRules = (tiles: Tile[], balance: BalanceMode): boolean => {
    if (hasAdjacentHotNumbers(tiles)) return false;
    if (balance === 'random') return true;
    const neighbours = neighbourIndex(tiles);
    return !hasClashingNumbers(tiles)
        && largestResourceCluster(tiles.map(tile => tile.resource), neighbours) <= MAX_RESOURCE_CLUSTER;
};

const RESOURCE_TYPES: ResourceType[] = ['empty', 'iron', 'clay', 'wood', 'wool', 'wheat'];

const sameInventory = <T>(actual: T[], expected: T[]): boolean => {
    const counts = new Map<T, number>();
    expected.forEach(value => counts.set(value, (counts.get(value) ?? 0) + 1));
    actual.forEach(value => counts.set(value, (counts.get(value) ?? 0) - 1));
    return actual.length === expected.length && [...counts.values()].every(count => count === 0);
};

const isTileShape = (tile: unknown, id: number, slot: {y: number, col: number}): tile is Tile => {
    if (typeof tile !== 'object' || tile === null) return false;
    const {id: tileId, y, col, resource, number, robber} = tile as Record<string, unknown>;
    return tileId === id
        && y === slot.y
        && col === slot.col
        && RESOURCE_TYPES.includes(resource as ResourceType)
        && typeof robber === 'boolean'
        && (resource === 'empty' ? number === null : Number.isInteger(number));
};

// Guards boards read from storage: exact types, the same tiles, tokens and slots as a fresh board,
// the robber on a desert, and 6/8 apart
export const isValidBoard = (mode: PlayerMode, tiles: unknown): tiles is Tile[] => {
    if (!Array.isArray(tiles)) return false;
    const {rows, resources, numbers} = BOARD_CONFIGS[mode];
    const slots = slotsFor(rows);
    if (tiles.length !== slots.length || !tiles.every((tile, id) => isTileShape(tile, id, slots[id]))) return false;
    const robbers = tiles.filter(tile => tile.robber);
    return robbers.length === 1
        && robbers[0].resource === 'empty'
        && sameInventory(tiles.map(tile => tile.resource), resources)
        && sameInventory(tiles.flatMap(tile => tile.number ?? []), numbers)
        && !hasAdjacentHotNumbers(tiles);
};
