import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dice', () => {
  render(<App />);
  expect(screen.getAllByTitle(/^[1-6]$/)).toHaveLength(2);
});
