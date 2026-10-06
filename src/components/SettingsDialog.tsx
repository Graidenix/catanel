import {useEffect, useRef} from 'react';
import SegmentedControl from './SegmentedControl';
import type {Settings} from '../hooks/useSettings';
import {BALANCE_MODES, BALANCE_OPTIONS, BOARD_CONFIGS, PLAYER_MODES} from '../utils/constants';

const PLAYER_OPTIONS = PLAYER_MODES.map(value => ({value, label: BOARD_CONFIGS[value].label}));
const BALANCE_CHOICES = BALANCE_OPTIONS.map(value => ({value, label: BALANCE_MODES[value]}));

const BALANCE_HINTS = {
    balanced: 'No equal numbers, 6 & 8 or 2 & 12 side by side, no clumps of 3+ tiles of the same resource, and good numbers shared fairly across resources.',
    random: 'Plain shuffle. Only 6 and 8 are kept apart, as in the official setup rules.',
};

interface SettingsDialogProps {
    open: boolean;
    settings: Settings;
    onChange: (patch: Partial<Settings>) => void;
    onClose: () => void;
}

const SettingsDialog = ({open, settings, onChange, onClose}: SettingsDialogProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className="dialog"
            aria-labelledby="settings-title"
            onClose={onClose}
            onClick={event => event.target === dialogRef.current && onClose()}
        >
            <div className="dialog__body">
                <h2 id="settings-title" className="dialog__title">Settings</h2>

                <fieldset className="field">
                    <legend className="field__label">Players</legend>
                    <SegmentedControl
                        label="Number of players"
                        value={settings.mode}
                        options={PLAYER_OPTIONS}
                        onChange={mode => onChange({mode})}
                    />
                </fieldset>

                <fieldset className="field">
                    <legend className="field__label">Map</legend>
                    <SegmentedControl
                        label="Map generation"
                        value={settings.balance}
                        options={BALANCE_CHOICES}
                        onChange={balance => onChange({balance})}
                    />
                    <p className="field__hint">{BALANCE_HINTS[settings.balance]}</p>
                    <p className="field__hint">Changing players or map type generates a new map.</p>
                </fieldset>

                <fieldset className="field">
                    <legend className="field__label">Show</legend>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={settings.showMap}
                            disabled={!settings.showDice}
                            onChange={event => onChange({showMap: event.target.checked})}
                        />
                        <span>Map</span>
                    </label>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={settings.showTokens}
                            disabled={!settings.showMap}
                            onChange={event => onChange({showTokens: event.target.checked})}
                        />
                        <span>Number tokens</span>
                    </label>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={settings.showDice}
                            disabled={!settings.showMap}
                            onChange={event => onChange({showDice: event.target.checked})}
                        />
                        <span>Dice</span>
                    </label>
                    <p className="field__hint">Map or dice must stay visible.</p>
                </fieldset>

                <button className="button button--primary" onClick={onClose}>Done</button>
            </div>
        </dialog>
    );
};

export default SettingsDialog;
