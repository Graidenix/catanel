import type {CSSProperties} from 'react';
import type {Tile} from './board';

// All measurements in hex widths; pointy-top hex height = width * 2/√3
const MARGIN = 0.45;
// Phones: no beach, so only leave room for the highlight glow
const COMPACT_MARGIN = 0.12;
const HEX_HEIGHT = 2 / Math.sqrt(3);
const ROW_PITCH = HEX_HEIGHT * 0.75;

export const HEX_RADIUS = HEX_HEIGHT / 2;

const percent = (value: number, total: number): string => `${value / total * 100}%`;

export interface BoardLayout {
    width: number;
    height: number;
    aspect: number;
    tileCenter: (tile: Tile) => [number, number];
    tileStyle: (tile: Tile) => CSSProperties;
}

export const boardLayout = (rows: number[], compact = false): BoardLayout => {
    const margin = compact ? COMPACT_MARGIN : MARGIN;
    const widest = Math.max(...rows);
    const width = widest + 2 * margin;
    const height = (rows.length - 1) * ROW_PITCH + HEX_HEIGHT + 2 * margin;
    const left = ({col}: Tile) => margin + col / 2;
    const top = ({y}: Tile) => margin + y * ROW_PITCH;

    return {
        width,
        height,
        aspect: width / height,
        tileCenter: tile => [left(tile) + 0.5, top(tile) + HEX_RADIUS],
        tileStyle: tile => ({
            left: percent(left(tile), width),
            top: percent(top(tile), height),
            width: percent(1, width),
            height: percent(HEX_HEIGHT, height),
        }),
    };
};
