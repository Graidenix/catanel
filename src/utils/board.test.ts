import {describe, expect, test} from 'vitest';
import {generateBoard, hasAdjacentHotNumbers, isValidBoard} from './board';
import {BOARD_CONFIGS, PLAYER_MODES} from './constants';

describe.each(PLAYER_MODES)('generateBoard(%s)', mode => {
    const config = BOARD_CONFIGS[mode];
    const tiles = generateBoard(mode);

    test('uses every tile and number token exactly once', () => {
        expect(tiles).toHaveLength(config.rows.reduce((a, b) => a + b, 0));
        expect(tiles.map(t => t.resource).sort()).toEqual([...config.resources].sort());
        expect(tiles.flatMap(t => t.number ?? []).sort()).toEqual([...config.numbers].sort());
    });

    test('places a single robber on a desert', () => {
        const robbers = tiles.filter(t => t.robber);
        expect(robbers).toHaveLength(1);
        expect(robbers[0].resource).toBe('empty');
    });

    test('never puts 6 and 8 next to each other', () => {
        for (let i = 0; i < 50; i++) {
            expect(hasAdjacentHotNumbers(generateBoard(mode))).toBe(false);
        }
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
});
