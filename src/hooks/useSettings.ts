import {useEffect, useState} from 'react';
import {PLAYER_MODES, type PlayerMode} from '../utils/constants';

export interface Settings {
    mode: PlayerMode;
    showMap: boolean;
    showDice: boolean;
    showTokens: boolean;
}

const STORAGE_KEY = 'catanel:settings';

const DEFAULT_SETTINGS: Settings = {
    mode: 'classic',
    showMap: true,
    showDice: true,
    showTokens: true,
};

const loadSettings = (): Settings => {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
        return {
            mode: PLAYER_MODES.includes(stored.mode) ? stored.mode : DEFAULT_SETTINGS.mode,
            showMap: typeof stored.showMap === 'boolean' ? stored.showMap : DEFAULT_SETTINGS.showMap,
            showDice: typeof stored.showDice === 'boolean' ? stored.showDice : DEFAULT_SETTINGS.showDice,
            showTokens: typeof stored.showTokens === 'boolean' ? stored.showTokens : DEFAULT_SETTINGS.showTokens,
        };
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

    const updateSettings = (patch: Partial<Settings>) => setSettings(prev => ({...prev, ...patch}));

    return {settings, updateSettings};
};

export default useSettings;
