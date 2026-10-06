import {act, renderHook} from '@testing-library/react';
import {beforeEach, describe, expect, test} from 'vitest';
import useSettings, {loadSettings} from './useSettings';

const STORAGE_KEY = 'catanel:settings';

beforeEach(() => localStorage.clear());

describe('loadSettings', () => {
    test('falls back to defaults for malformed storage', () => {
        localStorage.setItem(STORAGE_KEY, '{not json');
        expect(loadSettings()).toEqual({mode: 'classic', balance: 'balanced', showMap: true, showDice: true, showTokens: true});
    });

    test('ignores values of the wrong type or unknown options', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({mode: 'huge', balance: 1, showMap: 'no', showTokens: false}));
        expect(loadSettings()).toEqual({mode: 'classic', balance: 'balanced', showMap: true, showDice: true, showTokens: false});
    });

    test('brings the map back when storage hides both map and dice', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({showMap: false, showDice: false}));
        expect(loadSettings()).toMatchObject({showMap: true, showDice: false});
    });
});

describe('useSettings', () => {
    test('never lets an update hide both map and dice', () => {
        const {result} = renderHook(() => useSettings());
        act(() => result.current.updateSettings({showDice: false}));
        act(() => result.current.updateSettings({showMap: false}));
        expect(result.current.settings).toMatchObject({showMap: true, showDice: false});
    });

    test('persists changes', () => {
        const {result} = renderHook(() => useSettings());
        act(() => result.current.updateSettings({mode: 'extended', balance: 'random'}));
        expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toMatchObject({mode: 'extended', balance: 'random'});
    });
});
