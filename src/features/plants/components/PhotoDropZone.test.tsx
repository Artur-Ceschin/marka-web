import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { axe } from '@/test/axe';
import { renderWithRouter } from '@/test/router';

import { PhotoDropZone } from './PhotoDropZone';

const jpeg = () => new File(['jpeg'], 'plant.jpg', { type: 'image/jpeg' });

function fileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('file input not found');
  return input;
}

function dropTarget(): HTMLElement {
  return screen.getByRole('button', { name: /drop a plant photo here/i });
}

describe('PhotoDropZone', () => {
  it('accepts a photo chosen from the picker', async () => {
    const onPhoto = vi.fn();
    const user = userEvent.setup();
    const { container } = await renderWithRouter(
      <PhotoDropZone onPhoto={onPhoto} onReject={vi.fn()} />,
    );

    const photo = jpeg();
    await user.upload(fileInput(container), photo);

    expect(onPhoto).toHaveBeenCalledWith(photo);
  });

  it('offers only JPEG and PNG in the picker, and never forces the camera', async () => {
    const { container } = await renderWithRouter(
      <PhotoDropZone onPhoto={vi.fn()} onReject={vi.fn()} />,
    );

    const input = fileInput(container);
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png');
    // `capture` would skip the photo library on phones.
    expect(input).not.toHaveAttribute('capture');
  });

  it('accepts a dropped photo', async () => {
    const onPhoto = vi.fn();
    await renderWithRouter(<PhotoDropZone onPhoto={onPhoto} onReject={vi.fn()} />);

    const photo = jpeg();
    fireEvent.drop(dropTarget(), { dataTransfer: { files: [photo], types: ['Files'] } });

    expect(onPhoto).toHaveBeenCalledWith(photo);
  });

  it('rejects a dropped file that is not a JPEG or PNG', async () => {
    const onPhoto = vi.fn();
    const onReject = vi.fn();
    await renderWithRouter(<PhotoDropZone onPhoto={onPhoto} onReject={onReject} />);

    // A drag can carry any file; `accept` only filters the picker.
    const notes = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    fireEvent.drop(dropTarget(), { dataTransfer: { files: [notes], types: ['Files'] } });

    expect(onPhoto).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith('That file is not a JPEG or PNG photo.');
  });

  it('shows that a drop will be taken while a file is over it', async () => {
    await renderWithRouter(<PhotoDropZone onPhoto={vi.fn()} onReject={vi.fn()} />);

    fireEvent.dragEnter(dropTarget(), { dataTransfer: { types: ['Files'] } });

    expect(screen.getByText('Release to identify')).toBeInTheDocument();
  });

  it('ignores drops while an identification is running', async () => {
    const onPhoto = vi.fn();
    await renderWithRouter(<PhotoDropZone onPhoto={onPhoto} onReject={vi.fn()} disabled />);

    fireEvent.drop(dropTarget(), { dataTransfer: { files: [jpeg()], types: ['Files'] } });

    expect(onPhoto).not.toHaveBeenCalled();
  });

  it('is reachable by keyboard', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<PhotoDropZone onPhoto={vi.fn()} onReject={vi.fn()} />);

    await user.tab();

    expect(screen.getByRole('button', { name: /drop a plant photo here/i })).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    const { container } = await renderWithRouter(
      <PhotoDropZone onPhoto={vi.fn()} onReject={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
