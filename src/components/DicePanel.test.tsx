import {afterEach, describe, expect, test, vi} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import DicePanel from './DicePanel';
import {HISTORY_SIZE} from '../hooks/useDiceRoll';
import type {DicePair} from '../utils/dice';

const renderPanel = ({rolls = 0, dice = [0, 1] as DicePair | null, rolling = false, onClear = (): void => undefined} = {}) => render(
    <DicePanel
        dice={dice}
        rolling={rolling}
        history={Array.from({length: rolls}, (_, id) => ({id, dice: [0, 1] as DicePair}))}
        onRoll={() => undefined}
        onClear={onClear}
    />
).container;

// Vitest runs without globals, so Testing Library can't register its own cleanup
afterEach(cleanup);

test.each([0, 1, HISTORY_SIZE])('keeps %i rolls in a fixed number of history slots', rolls => {
    const container = renderPanel({rolls});
    expect(container.querySelectorAll('.history__item')).toHaveLength(HISTORY_SIZE);
    expect(container.querySelectorAll('.history__item--empty')).toHaveLength(HISTORY_SIZE - rolls);
});

describe('clear dice', () => {
    test('calls onClear for a current roll', () => {
        const onClear = vi.fn<() => void>();
        renderPanel({onClear});
        fireEvent.click(screen.getByRole('button', {name: 'Clear dice'}));
        expect(onClear).toHaveBeenCalledOnce();
    });

    test('shows blank dice and no total once cleared', () => {
        const container = renderPanel({dice: null});
        expect((screen.getByRole('button', {name: 'Clear dice'}) as HTMLButtonElement).disabled).toBe(true);
        expect(container.querySelector('.sum__value')?.textContent).toBe('–');
        expect(container.querySelectorAll('.dice__point:not([data-on="0"])')).toHaveLength(0);
    });
});

const status = () => screen.getByRole('status').textContent;

describe('roll announcement', () => {
    test('announces a settled roll and flags the robber', () => {
        renderPanel({rolls: 1, dice: [2, 3]});
        expect(status()).toBe('Rolled 7, robber moves');
    });

    test('stays silent while rolling, before the first roll, and after clearing', () => {
        renderPanel({rolls: 1, rolling: true});
        expect(status()).toBe('');
        cleanup();
        renderPanel({rolls: 0});
        expect(status()).toBe('');
        cleanup();
        renderPanel({rolls: 1, dice: null});
        expect(status()).toBe('');
    });
});
