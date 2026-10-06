export type ResourceType = 'empty' | 'iron' | 'clay' | 'wood' | 'wool' | 'wheat';

export type PlayerMode = 'classic' | 'extended';

// balanced: 6/8, equal numbers and 2/12 never touch, no 3+ resource clumps, numbers shared fairly across resources
// random: plain shuffle, only keeping 6 and 8 apart (the official setup rule)
export type BalanceMode = 'balanced' | 'random';

export const BALANCE_MODES: Record<BalanceMode, string> = {
    balanced: 'Balanced',
    random: 'Random',
};

export interface BoardConfig {
    label: string;
    // hexes per row, top to bottom
    rows: number[];
    resources: ResourceType[];
    numbers: number[];
}

const repeat = <T>(value: T, count: number): T[] => Array<T>(count).fill(value);

export const BOARD_CONFIGS: Record<PlayerMode, BoardConfig> = {
    classic: {
        label: '3–4 players',
        rows: [3, 4, 5, 4, 3],
        resources: [
            ...repeat<ResourceType>('empty', 1),
            ...repeat<ResourceType>('iron', 3),
            ...repeat<ResourceType>('clay', 3),
            ...repeat<ResourceType>('wood', 4),
            ...repeat<ResourceType>('wool', 4),
            ...repeat<ResourceType>('wheat', 4),
        ],
        numbers: [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12],
    },
    extended: {
        label: '5–6 players',
        rows: [3, 4, 5, 6, 5, 4, 3],
        resources: [
            ...repeat<ResourceType>('empty', 2),
            ...repeat<ResourceType>('iron', 5),
            ...repeat<ResourceType>('clay', 5),
            ...repeat<ResourceType>('wood', 6),
            ...repeat<ResourceType>('wool', 6),
            ...repeat<ResourceType>('wheat', 6),
        ],
        numbers: [2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12],
    },
};

export const PLAYER_MODES = Object.keys(BOARD_CONFIGS) as PlayerMode[];

export const BALANCE_OPTIONS = Object.keys(BALANCE_MODES) as BalanceMode[];

export const HOT_NUMBERS = [6, 8];

export const ROBBER_ROLL = 7;

// Phone-style map (no beach, borderless tiles). Keep in sync with $compact-map in src/index.scss
export const COMPACT_QUERY = '(max-width: 860px), (orientation: landscape) and (max-height: 500px)';
