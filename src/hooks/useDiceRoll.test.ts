import {act, renderHook} from '@testing-library/react';
import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import useDiceRoll, {HISTORY_SIZE} from './useDiceRoll';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const ROLL_DURATION = 600;

const rollOnce = (result: {current: ReturnType<typeof useDiceRoll>}) => {
    act(() => result.current.roll());
    act(() => vi.advanceTimersByTime(ROLL_DURATION));
};

test('starts blank with no history', () => {
    const {result} = renderHook(() => useDiceRoll());
    expect(result.current).toMatchObject({dice: null, rolling: false, history: []});
});

test('records exactly one history entry when a roll settles', () => {
    const {result} = renderHook(() => useDiceRoll());
    act(() => result.current.roll());
    expect(result.current.rolling).toBe(true);
    act(() => vi.advanceTimersByTime(ROLL_DURATION - 1));
    expect(result.current.history).toHaveLength(0);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.rolling).toBe(false);
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].dice).toEqual(result.current.dice);
});

test('keeps only the latest rolls, newest first, with unique ids', () => {
    const {result} = renderHook(() => useDiceRoll());
    for (let i = 0; i < HISTORY_SIZE + 3; i++) rollOnce(result);
    const ids = result.current.history.map(entry => entry.id);
    expect(ids).toHaveLength(HISTORY_SIZE);
    expect(new Set(ids).size).toBe(HISTORY_SIZE);
    expect(ids).toEqual([...ids].toSorted((a, b) => b - a));
});

test('clear blanks the dice but keeps history', () => {
    const {result} = renderHook(() => useDiceRoll());
    rollOnce(result);
    act(() => result.current.clear());
    expect(result.current.dice).toBeNull();
    expect(result.current.history).toHaveLength(1);
});

test('unmounting mid-roll cancels its timers', () => {
    const {result, unmount} = renderHook(() => useDiceRoll());
    act(() => result.current.roll());
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
});
