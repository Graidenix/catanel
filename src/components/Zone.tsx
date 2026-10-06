import type {CSSProperties} from 'react';
import NumberToken from './NumberToken';
import type {Tile} from '../utils/board';

interface ZoneProps {
    tile: Tile;
    style: CSSProperties;
    highlighted: boolean;
    showToken: boolean;
}

const Zone = ({tile, style, highlighted, showToken}: ZoneProps) => (
    <div
        className={`zone${highlighted ? ' zone--highlighted' : ''}`}
        style={style}
        title={tile.resource === 'empty' ? 'desert' : tile.resource}
    >
        <div className="zone__hex">
            <div className={`zone__face zone__face--${tile.resource}`}/>
        </div>
        {showToken && tile.number !== null && <NumberToken value={tile.number}/>}
        {tile.robber && <div className="robber"/>}
    </div>
);

export default Zone;
