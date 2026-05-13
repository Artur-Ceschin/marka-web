import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PasswordInput } from './PasswordInput';

vi.mock('@/components/ui', () => ({
  Input: ({ type, label, ...props }: { type: string; label: string; [key: string]: unknown }) => (
    <div>
      <label>{label}</label>
      <input type={type} aria-label={label} {...props} />
    </div>
  ),
}));

describe('PasswordInput', () => {
  it('renders as password type by default', () => {
    render(<PasswordInput label="Password" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('toggles to text when show button is clicked', async () => {
    render(<PasswordInput label="Password" />);
    await userEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });

  it('toggles back to password on second click', async () => {
    render(<PasswordInput label="Password" />);
    await userEvent.click(screen.getByRole('button', { name: /show password/i }));
    await userEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });
});
