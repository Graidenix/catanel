export type ResourceType = 'empty' | 'iron' | 'clay' | 'wood' | 'wool' | 'wheat';

export type PlayerMode = 'classic' | 'extended';

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

export const HOT_NUMBERS = [6, 8];

export const ROBBER_ROLL = 7;

// Keep in sync with $compact in src/index.scss
export const COMPACT_QUERY = '(max-width: 860px)';
