import {useId} from 'react';
import type {Tile} from '../utils/board';
import {HEX_RADIUS, type BoardLayout} from '../utils/layout';

// SVG works in hundredths of a hex width so filter values stay readable
const SCALE = 100;
// How far the sea glow may spill outside the board, in hex widths
const OVERFLOW = 0.9;

// Each coast layer is the union of enlarged tile hexes, melted together by the filter
const LAYERS = {
    shallows: 1.95,
    swell: 1.62,
    foam: 1.5,
    wetSand: 1.42,
    sand: 1.34,
};

const hexPoints = ([cx, cy]: [number, number], grow: number): string =>
    Array.from({length: 6}, (_, i) => {
        const angle = Math.PI / 3 * i - Math.PI / 2;
        const r = HEX_RADIUS * grow * SCALE;
        return `${(cx * SCALE + r * Math.cos(angle)).toFixed(1)},${(cy * SCALE + r * Math.sin(angle)).toFixed(1)}`;
    }).join(' ');

interface IslandProps {
    tiles: Tile[];
    layout: BoardLayout;
    beach: boolean;
}

const Island = ({tiles, layout, beach}: IslandProps) => {
    const id = useId().replace(/:/g, '');
    const centers = tiles.map(tile => ({id: tile.id, center: layout.tileCenter(tile)}));
    const shape = (grow: number) => centers.map(({id: key, center}) => (
        <polygon key={key} points={hexPoints(center, grow)}/>
    ));
    const [cx, cy] = [layout.width / 2 * SCALE, layout.height / 2 * SCALE];

    return (
        <svg
            className="island"
            viewBox={`${-OVERFLOW * SCALE} ${-OVERFLOW * SCALE} ${(layout.width + 2 * OVERFLOW) * SCALE} ${(layout.height + 2 * OVERFLOW) * SCALE}`}
            style={{
                left: `${-OVERFLOW / layout.width * 100}%`,
                top: `${-OVERFLOW / layout.height * 100}%`,
                width: `${(layout.width + 2 * OVERFLOW) / layout.width * 100}%`,
                height: `${(layout.height + 2 * OVERFLOW) / layout.height * 100}%`,
            }}
            aria-hidden="true"
        >
            <defs>
                <filter id={`${id}-coast`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur"/>
                    <feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -13" result="melted"/>
                    <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7" result="noise"/>
                    <feDisplacementMap in="melted" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G"/>
                </filter>
                <filter id={`${id}-sand`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur"/>
                    <feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -13" result="melted"/>
                    <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7" result="noise"/>
                    <feDisplacementMap in="melted" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" result="shape"/>
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="grain"/>
                    <feColorMatrix in="grain" values="0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.16  1.2 0 0 0 -0.55" result="grainColor"/>
                    <feComposite in="grainColor" in2="shape" operator="in" result="grainIn"/>
                    <feMerge>
                        <feMergeNode in="shape"/>
                        <feMergeNode in="grainIn"/>
                    </feMerge>
                </filter>
                <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="34"/>
                </filter>
                <radialGradient id={`${id}-sand-fill`} gradientUnits="userSpaceOnUse" cx={cx} cy={cy * 0.9} r={Math.max(cx, cy) * 1.1}>
                    <stop offset="0" stopColor="#f6e2ae"/>
                    <stop offset="0.6" stopColor="#ecd197"/>
                    <stop offset="1" stopColor="#d9b574"/>
                </radialGradient>
            </defs>

            <g className="island__shallows" fill="#5fe0d6" filter={`url(#${id}-glow)`}>{shape(LAYERS.shallows)}</g>
            {beach && (
                <>
                    <g className="island__swell" fill="#ffffff" filter={`url(#${id}-coast)`}>{shape(LAYERS.swell)}</g>
                    <g className="island__foam" fill="#f4fbfb" filter={`url(#${id}-coast)`}>{shape(LAYERS.foam)}</g>
                    <g fill="#b98e55" filter={`url(#${id}-coast)`}>{shape(LAYERS.wetSand)}</g>
                    <g fill={`url(#${id}-sand-fill)`} filter={`url(#${id}-sand)`}>{shape(LAYERS.sand)}</g>
                </>
            )}
        </svg>
    );
};

export default Island;
