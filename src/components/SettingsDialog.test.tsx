import {afterEach, beforeAll, describe, expect, test, vi} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import SettingsDialog from './SettingsDialog';
import type {Settings} from '../hooks/useSettings';

const SETTINGS: Settings = {mode: 'classic', balance: 'balanced', showMap: true, showDice: true, showTokens: true};

// jsdom has no modal dialog support; mimic the open attribute and the close event
function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
}

function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
}

beforeAll(() => {
    HTMLDialogElement.prototype.showModal = showModal;
    HTMLDialogElement.prototype.close = close;
});

afterEach(cleanup);

const renderDialog = (settings: Partial<Settings> = {}) => {
    const onChange = vi.fn<(patch: Partial<Settings>) => void>();
    const onClose = vi.fn<() => void>();
    render(<SettingsDialog open settings={{...SETTINGS, ...settings}} onChange={onChange} onClose={onClose}/>);
    return {onChange, onClose};
};


describe('SettingsDialog', () => {
    test('opens as a modal when open', () => {
        renderDialog();
        expect(screen.getByRole('dialog', {hidden: true}).hasAttribute('open')).toBe(true);
    });

    test('reports player count and map type changes', () => {
        const {onChange} = renderDialog();
        fireEvent.click(screen.getByRole('radio', {name: '5–6 players', hidden: true}));
        fireEvent.click(screen.getByRole('radio', {name: 'Random', hidden: true}));
        expect(onChange).toHaveBeenNthCalledWith(1, {mode: 'extended'});
        expect(onChange).toHaveBeenNthCalledWith(2, {balance: 'random'});
    });

    test('reports visibility toggles', () => {
        const {onChange} = renderDialog();
        fireEvent.click(screen.getByRole('checkbox', {name: 'Number tokens', hidden: true}));
        expect(onChange).toHaveBeenCalledWith({showTokens: false});
    });

    test('locks the last visible of map and dice', () => {
        renderDialog({showDice: false});
        expect(screen.getByRole('checkbox', {name: 'Map', hidden: true})).toHaveProperty('disabled', true);
        expect(screen.getByRole('checkbox', {name: 'Number tokens', hidden: true})).toHaveProperty('disabled', false);
    });

    test('closes from the Done button', () => {
        const {onClose} = renderDialog();
        fireEvent.click(screen.getByRole('button', {name: 'Done', hidden: true}));
        expect(onClose).toHaveBeenCalledOnce();
    });

    test('closes when the dialog itself fires close (Esc)', () => {
        const {onClose} = renderDialog();
        fireEvent(screen.getByRole('dialog', {hidden: true}), new Event('close'));
        expect(onClose).toHaveBeenCalledOnce();
    });
});
