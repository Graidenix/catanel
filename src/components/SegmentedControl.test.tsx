import {useState} from 'react';
import {afterEach, expect, test} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import SegmentedControl from './SegmentedControl';

afterEach(cleanup);

const OPTIONS = [{value: 'a', label: 'A'}, {value: 'b', label: 'B'}, {value: 'c', label: 'C'}];

const Harness = () => {
    const [value, setValue] = useState('a');
    return <SegmentedControl label="Pick" value={value} options={OPTIONS} onChange={setValue}/>;
};

const radio = (name: string) => screen.getByRole('radio', {name});

test('only the checked option is a tab stop', () => {
    render(<Harness/>);
    expect(radio('A').tabIndex).toBe(0);
    expect(radio('B').tabIndex).toBe(-1);
});

test('arrow keys, Home and End move the selection and focus, wrapping around', () => {
    render(<Harness/>);
    fireEvent.keyDown(radio('A'), {key: 'ArrowRight'});
    expect(radio('B').getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(radio('B'));

    fireEvent.keyDown(radio('B'), {key: 'End'});
    expect(radio('C').getAttribute('aria-checked')).toBe('true');

    fireEvent.keyDown(radio('C'), {key: 'ArrowDown'});
    expect(radio('A').getAttribute('aria-checked')).toBe('true');

    fireEvent.keyDown(radio('A'), {key: 'ArrowLeft'});
    expect(radio('C').getAttribute('aria-checked')).toBe('true');

    fireEvent.keyDown(radio('C'), {key: 'Home'});
    expect(radio('A').getAttribute('aria-checked')).toBe('true');
});
