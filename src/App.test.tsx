import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App';

afterEach(cleanup);

test('starts with two blank dice and nothing highlighted', () => {
  const { container } = render(<App />);
  expect(screen.getAllByTitle('not rolled')).toHaveLength(2);
  expect(container.querySelectorAll('.zone--highlighted')).toHaveLength(0);
});
