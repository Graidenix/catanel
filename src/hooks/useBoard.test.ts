import {beforeEach, expect, test} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import useBoard from './useBoard';

beforeEach(() => localStorage.clear());

test('restores the last generated board after a reload', () => {
    const first = renderHook(() => useBoard('classic'));
    act(() => first.result.current.regenerate('classic'));
    const saved = first.result.current.tiles;
    first.unmount();

    expect(renderHook(() => useBoard('classic')).result.current.tiles).toEqual(saved);
});

test('generates a fresh board when the stored one is for another mode', () => {
    const first = renderHook(() => useBoard('classic'));
    first.unmount();

    expect(renderHook(() => useBoard('extended')).result.current.tiles).toHaveLength(30);
});
