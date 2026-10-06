import {describe, expect, test} from 'vitest';
import {
    areNeighbours,
    followsRules,
    generateBoard,
    hasAdjacentHotNumbers,
    hasClashingNumbers,
    isValidBoard,
    largestResourceCluster,
    MAX_PIP_SPREAD,
    MAX_RESOURCE_CLUSTER,
    pipSpread,
    type Tile,
} from './board';
import {BALANCE_OPTIONS, BOARD_CONFIGS, PLAYER_MODES} from './constants';

const SAMPLES = 40;

// Deterministic Math.random replacement (mulberry32) so property tests are repeatable
const seededRandom = (seed: number) => () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Swaps Math.random directly: a vi.spyOn mock would record millions of calls and exhaust memory
const withRandom = <T>(random: () => number, run: () => T): T => {
    const original = Math.random;
    Math.random = random;
    try {
        return run();
    } finally {
        Math.random = original;
    }
};

const withSeed = <T>(seed: number, run: () => T): T => withRandom(seededRandom(seed), run);

const clusterOf = (tiles: Tile[]) =>
    largestResourceCluster(tiles.map(t => t.resource), tiles.map(a => tiles.flatMap((b, j) => (areNeighbours(a, b) ? [j] : []))));

describe.each(PLAYER_MODES.flatMap(mode => BALANCE_OPTIONS.map(balance => [mode, balance] as const)))('generateBoard(%s, %s)', (mode, balance) => {
    const config = BOARD_CONFIGS[mode];
    const tiles = withSeed(1, () => generateBoard(mode, balance));

    test('uses every tile and number token exactly once', () => {
        expect(tiles).toHaveLength(config.rows.reduce((a, b) => a + b, 0));
        expect(tiles.map(t => t.resource).toSorted()).toEqual(config.resources.toSorted());
        expect(tiles.flatMap(t => t.number ?? []).toSorted()).toEqual(config.numbers.toSorted());
        expect(isValidBoard(mode, tiles)).toBe(true);
    });

    test('places a single robber on a desert', () => {
        const robbers = tiles.filter(t => t.robber);
        expect(robbers).toHaveLength(1);
        expect(robbers[0].resource).toBe('empty');
    });

    test('never puts 6 and 8 next to each other', () => {
        for (let seed = 0; seed < SAMPLES; seed++) {
            expect(hasAdjacentHotNumbers(withSeed(seed, () => generateBoard(mode, balance)))).toBe(false);
        }
    });
});

describe.each(PLAYER_MODES)('balanced %s boards', mode => {
    const boards = Array.from({length: SAMPLES}, (_, seed) => withSeed(seed, () => generateBoard(mode, 'balanced')));

    test('never put equal numbers, 6 & 8, or 2 & 12 side by side', () => {
        boards.forEach(tiles => expect(hasClashingNumbers(tiles)).toBe(false));
    });

    test('have no clumps of 3 or more same-resource tiles', () => {
        boards.forEach(tiles => expect(clusterOf(tiles)).toBeLessThanOrEqual(MAX_RESOURCE_CLUSTER));
    });

    test('share good numbers fairly across resources', () => {
        boards.forEach(tiles => expect(pipSpread(tiles)).toBeLessThanOrEqual(MAX_PIP_SPREAD));
    });
});

describe.each(PLAYER_MODES.flatMap(mode => BALANCE_OPTIONS.map(balance => [mode, balance] as const)))('when retries run out (%s, %s)', (mode, balance) => {
    // A constant random source makes every shuffle identical, so the retry loops can never succeed
    test('still returns a board that follows the rules', () => {
        const tiles = withRandom(() => 0, () => generateBoard(mode, balance));
        expect(isValidBoard(mode, tiles)).toBe(true);
        expect(followsRules(tiles, balance)).toBe(true);
    });
});

describe('isValidBoard', () => {
    test('accepts a generated board for its own mode only', () => {
        const tiles = generateBoard('classic');
        expect(isValidBoard('classic', JSON.parse(JSON.stringify(tiles)))).toBe(true);
        expect(isValidBoard('extended', tiles)).toBe(false);
    });

    test('rejects tampered or malformed data', () => {
        const tiles = generateBoard('classic');
        const extraEight = tiles.map(t => (t.number === 9 ? {...t, number: 8} : t));
        expect(isValidBoard('classic', extraEight)).toBe(false);
        expect(isValidBoard('classic', tiles.slice(1))).toBe(false);
        expect(isValidBoard('classic', [null])).toBe(false);
        expect(isValidBoard('classic', 'tiles')).toBe(false);
    });

    test('rejects numbers stored as text', () => {
        const tiles = generateBoard('classic');
        expect(isValidBoard('classic', tiles.map(t => ({...t, number: t.number === null ? null : String(t.number)})))).toBe(false);
    });

    test('rejects a robber that is not on a desert', () => {
        const tiles = generateBoard('classic');
        const moved = tiles.map(t => ({...t, robber: t.resource === 'wood' && t === tiles.find(x => x.resource === 'wood')}));
        expect(isValidBoard('classic', moved)).toBe(false);
    });

    test('rejects 6 and 8 side by side', () => {
        const tiles = generateBoard('classic', 'random');
        const hot = tiles.find(t => t.number === 6)!;
        const neighbour = tiles.find(t => t.number !== null && t.number !== 6 && t.number !== 8 && areNeighbours(t, hot))!;
        const eight = tiles.find(t => t.number === 8)!;
        // swap an 8 next to the 6
        const swapped = tiles.map(t =>
            t.id === neighbour.id ? {...t, number: 8} : t.id === eight.id ? {...t, number: neighbour.number} : t);
        expect(isValidBoard('classic', swapped)).toBe(false);
    });
});
