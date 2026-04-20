import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateLicenseModal from './CreateLicenseModal';

describe('CreateLicenseModal', () => {
  it('validates duration days', async () => {
    const user = userEvent.setup();
    render(<CreateLicenseModal open onOpenChange={vi.fn()} onSubmit={vi.fn()} />);

    const duration = screen.getByLabelText('Duration (days)');
    await user.clear(duration);
    await user.type(duration, '0');
    await user.click(screen.getByRole('button', { name: 'Create & Copy' }));

    expect(screen.getByText('Duration (days) must be greater than 0')).toBeInTheDocument();
  });

  it('submits valid payload', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CreateLicenseModal open onOpenChange={vi.fn()} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText('Duration (days)'));
    await user.type(screen.getByLabelText('Duration (days)'), '45');
    await user.type(screen.getByLabelText('Assign to user (optional)'), 'alice');
    await user.click(screen.getByRole('button', { name: 'Create & Copy' }));

    expect(onSubmit).toHaveBeenCalledWith({ duration_days: 45, username: 'alice' });
  });
});
