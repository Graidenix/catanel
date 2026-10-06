import {describe, expect, test} from 'vitest';
import {render} from '@testing-library/react';
import Board from './Board';
import type {Tile} from '../utils/board';

const TILES: Tile[] = [
    {id: 0, y: 0, col: 0, resource: 'empty', number: null, robber: true},
    {id: 1, y: 0, col: 2, resource: 'wood', number: 6, robber: false},
    {id: 2, y: 1, col: 1, resource: 'clay', number: 9, robber: false},
];

const renderBoard = (rolled: number | null) =>
    render(<Board mode="classic" tiles={TILES} rolled={rolled} showTokens/>).container;

describe('Board', () => {
    test('highlights nothing, desert included, when there is no roll', () => {
        const container = renderBoard(null);
        expect(container.querySelectorAll('.zone--highlighted')).toHaveLength(0);
        expect(container.querySelector('.board--dimmed')).toBeNull();
    });

    test('highlights matching tiles and dims the rest', () => {
        const container = renderBoard(6);
        expect(container.querySelectorAll('.zone--highlighted')).toHaveLength(1);
        expect(container.querySelector('.board--dimmed')).not.toBeNull();
    });

    test('does not dim when the roll matches no tile', () => {
        expect(renderBoard(7).querySelector('.board--dimmed')).toBeNull();
    });
});
