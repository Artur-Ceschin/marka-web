import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { axe } from '@/test/axe';

import { Button } from './Button';

describe('Button', () => {
  it('renders a real button defaulting to type="button"', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    // Not `type="submit"`: the HTML default would submit any enclosing form.
    expect(button).toHaveAttribute('type', 'button');
  });

  it('honours an explicit type', () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'submit');
  });

  it('calls onClick when activated', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Tap</Button>);

    await user.click(screen.getByRole('button', { name: 'Tap' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is reachable and activatable by keyboard', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Tap</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Tap' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('marks itself busy and disabled while loading', () => {
    render(<Button loading>Saving</Button>);
    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });

  it('does not set aria-busy when idle', () => {
    render(<Button>Idle</Button>);
    expect(screen.getByRole('button', { name: 'Idle' })).not.toHaveAttribute('aria-busy');
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        Nope
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: 'Nope' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders the child element with asChild, keeping it a link', () => {
    render(
      <Button asChild>
        <a href="/plants">Browse</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Browse' });
    expect(link).toHaveAttribute('href', '/plants');
    // A link must not pick up button-only attributes.
    expect(link).not.toHaveAttribute('type');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies variant and size classes', () => {
    render(
      <Button variant="ghost" size="sm">
        Ghost
      </Button>,
    );
    // SCSS Modules are hashed, so assert on the stable substring rather than an
    // exact class name.
    expect(screen.getByRole('button', { name: 'Ghost' }).className).toMatch(/ghost/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Accessible</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations while loading', async () => {
    const { container } = render(<Button loading>Loading</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
