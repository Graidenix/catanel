import {beforeEach, expect, test} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import useBoard from './useBoard';
import {areNeighbours, followsRules, generateBoard} from '../utils/board';

const CLASSIC = {mode: 'classic', balance: 'balanced'} as const;

beforeEach(() => localStorage.clear());

test('restores the last generated board after a reload', () => {
    const first = renderHook(() => useBoard(CLASSIC));
    act(() => first.result.current.regenerate(CLASSIC));
    const saved = first.result.current.tiles;
    first.unmount();

    expect(renderHook(() => useBoard(CLASSIC)).result.current.tiles).toEqual(saved);
});

test('generates a fresh board when the stored one is for another mode', () => {
    renderHook(() => useBoard(CLASSIC)).unmount();

    expect(renderHook(() => useBoard({mode: 'extended', balance: 'balanced'})).result.current.tiles).toHaveLength(30);
});

test('generates a fresh board when the stored one used another map type', () => {
    const first = renderHook(() => useBoard(CLASSIC));
    const saved = first.result.current.tiles;
    first.unmount();

    expect(renderHook(() => useBoard({mode: 'classic', balance: 'random'})).result.current.tiles).not.toBe(saved);
    expect(JSON.parse(localStorage.getItem('catanel:board')!).balance).toBe('random');
});

test('regenerates a stored balanced board that breaks the balanced rules', () => {
    const tiles = generateBoard('classic', 'balanced');
    // make two neighbours share a number by swapping tokens, keeping the token inventory intact;
    // 3–5 and 9–11 appear twice in the 3–4 player set, so the first one always has a twin to swap with
    const [a, b] = tiles.flatMap(x => tiles.filter(y => x.id < y.id && areNeighbours(x, y)).map(y => [x, y] as const))
        .find(([x, y]) => y.number !== null && [3, 4, 5, 9, 10, 11].includes(x.number ?? 0))!;
    const twin = tiles.find(t => t.id !== a.id && t.number === a.number)!;
    const broken = tiles.map(t => (t.id === b.id ? {...t, number: a.number} : t.id === twin.id ? {...t, number: b.number} : t));
    expect(followsRules(broken, 'balanced')).toBe(false);
    localStorage.setItem('catanel:board', JSON.stringify({mode: 'classic', balance: 'balanced', tiles: broken}));

    const restored = renderHook(() => useBoard(CLASSIC)).result.current.tiles;
    expect(restored).not.toEqual(broken);
    expect(followsRules(restored, 'balanced')).toBe(true);
});
