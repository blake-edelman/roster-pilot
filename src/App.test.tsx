import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('Roster Pilot dashboard', () => {
  it('filters the decision board by position', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'RB' }));
    const board = screen.getByRole('region', { name: 'Recommended pilots' });
    expect(within(board).getByText('Josh Jacobs')).toBeVisible();
    expect(within(board).queryByText('Brock Bowers')).not.toBeInTheDocument();
  });

  it('records a practice pick and assigns it to a legal roster slot', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Josh Jacobs'));
    fireEvent.click(screen.getByRole('button', { name: 'Draft Josh Jacobs' }));

    expect(screen.getByRole('heading', { name: 'Next pick: 3.08' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Pick submitted' })).toBeDisabled();
    const roster = screen.getByRole('heading', { name: 'Starting roster' }).closest('.panel') as HTMLElement;
    expect(within(roster).getByText('Josh Jacobs')).toBeVisible();
  });
});
