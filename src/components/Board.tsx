import type {CSSProperties} from 'react';
import Island from './Island';
import Zone from './Zone';
import type {Tile} from '../utils/board';
import useMediaQuery from '../hooks/useMediaQuery';
import {BOARD_CONFIGS, COMPACT_QUERY, type PlayerMode} from '../utils/constants';
import {boardLayout} from '../utils/layout';

interface BoardProps {
    mode: PlayerMode;
    tiles: Tile[];
    rolled: number | null;
    showTokens: boolean;
}

const Board = ({mode, tiles, rolled, showTokens}: BoardProps) => {
    const compact = useMediaQuery(COMPACT_QUERY);
    const layout = boardLayout(BOARD_CONFIGS[mode].rows, compact);
    const hasMatches = rolled !== null && tiles.some(tile => tile.number === rolled);
    return (
        <div
            className={['board', compact && 'board--compact', hasMatches && 'board--dimmed'].filter(Boolean).join(' ')}
            style={{aspectRatio: layout.aspect, '--board-aspect': layout.aspect} as CSSProperties}
            role="group"
            aria-label={`Randomly generated Catan board for ${BOARD_CONFIGS[mode].label}`}
        >
            <Island tiles={tiles} layout={layout} beach={!compact}/>
            {tiles.map(tile => (
                <Zone
                    key={tile.id}
                    tile={tile}
                    style={layout.tileStyle(tile)}
                    highlighted={rolled !== null && tile.number === rolled}
                    showToken={showTokens}
                />
            ))}
        </div>
    );
};

export default Board;
