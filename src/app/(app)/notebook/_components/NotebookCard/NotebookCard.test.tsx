import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { NotebookCard } from './NotebookCard';
import type { NotebookEntry } from '@/lib/api';

const entry: NotebookEntry = {
  id: '1',
  userId: 'u1',
  userName: 'Artur',
  plantName: 'Common Oak',
  latinName: 'Quercus robur',
  confidence: 0.91,
  imageUrl: '/images/plant-sequoia.avif',
  tags: [],
  likeCount: 0,
  identifiedAt: new Date('2026-04-01T10:30:00Z').toISOString(),
  entityType: 'NOTEBOOK_ENTRY',
};

describe('NotebookCard', () => {
  it('renders plant name and latin name', () => {
    render(<NotebookCard entry={entry} />);
    expect(screen.getByText('Common Oak')).toBeInTheDocument();
    expect(screen.getByText('Quercus robur')).toBeInTheDocument();
  });

  it('shows High Match badge for confidence >= 0.8', () => {
    render(<NotebookCard entry={entry} />);
    expect(screen.getByText('High Match')).toBeInTheDocument();
  });

  it('hides High Match badge for low confidence', () => {
    render(<NotebookCard entry={{ ...entry, confidence: 0.5 }} />);
    expect(screen.queryByText('High Match')).not.toBeInTheDocument();
  });

  it('fires onClick when the card is clicked', async () => {
    const onClick = vi.fn();
    render(<NotebookCard entry={entry} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(entry);
  });
});
