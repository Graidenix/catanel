import {useEffect, useState} from 'react';
import {BALANCE_OPTIONS, PLAYER_MODES, type BalanceMode, type PlayerMode} from '../utils/constants';

export interface Settings {
    mode: PlayerMode;
    balance: BalanceMode;
    showMap: boolean;
    showDice: boolean;
    showTokens: boolean;
}

const STORAGE_KEY = 'catanel:settings';

const DEFAULT_SETTINGS: Settings = {
    mode: 'classic',
    balance: 'balanced',
    showMap: true,
    showDice: true,
    showTokens: true,
};

// Map or dice must stay visible, otherwise the page is empty and the settings can't re-enable either
export const withVisibleContent = (settings: Settings): Settings =>
    settings.showMap || settings.showDice ? settings : {...settings, showMap: true};

export const loadSettings = (): Settings => {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
        return withVisibleContent({
            mode: PLAYER_MODES.includes(stored.mode) ? stored.mode : DEFAULT_SETTINGS.mode,
            balance: BALANCE_OPTIONS.includes(stored.balance) ? stored.balance : DEFAULT_SETTINGS.balance,
            showMap: typeof stored.showMap === 'boolean' ? stored.showMap : DEFAULT_SETTINGS.showMap,
            showDice: typeof stored.showDice === 'boolean' ? stored.showDice : DEFAULT_SETTINGS.showDice,
            showTokens: typeof stored.showTokens === 'boolean' ? stored.showTokens : DEFAULT_SETTINGS.showTokens,
        });
    } catch {
        return DEFAULT_SETTINGS;
    }
};

const useSettings = () => {
    const [settings, setSettings] = useState(loadSettings);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch {
            // storage unavailable (private mode, blocked) — settings just won't persist
        }
    }, [settings]);

    const updateSettings = (patch: Partial<Settings>) => setSettings(prev => withVisibleContent({...prev, ...patch}));

    return {settings, updateSettings};
};

export default useSettings;
