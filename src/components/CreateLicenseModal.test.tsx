import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateLicenseModal from './CreateLicenseModal';

const applications = [
  {
    id: 1,
    name: 'tool_reup_youtube_master',
    description: 'Tool reup YouTube',
    created_at: '2026-08-07 10:00:00',
    updated_at: null
  }
];

describe('CreateLicenseModal', () => {
  it('validates duration days', async () => {
    const user = userEvent.setup();
    render(<CreateLicenseModal open applications={applications} onOpenChange={vi.fn()} onSubmit={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText('Ứng dụng'), 'tool_reup_youtube_master');
    const duration = screen.getByLabelText('Duration (days)');
    await user.clear(duration);
    await user.type(duration, '0');
    await user.click(screen.getByRole('button', { name: 'Create & Copy' }));

    expect(screen.getByText('Duration (days) must be greater than 0')).toBeInTheDocument();
  });

  it('submits valid payload', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CreateLicenseModal open applications={applications} onOpenChange={vi.fn()} onSubmit={onSubmit} />);

    await user.selectOptions(screen.getByLabelText('Ứng dụng'), 'tool_reup_youtube_master');
    await user.clear(screen.getByLabelText('Duration (days)'));
    await user.type(screen.getByLabelText('Duration (days)'), '45');
    await user.type(screen.getByLabelText('Assign to user (optional)'), 'alice');
    await user.click(screen.getByRole('button', { name: 'Create & Copy' }));

    expect(onSubmit).toHaveBeenCalledWith({
      duration_days: 45,
      app_name: 'tool_reup_youtube_master',
      username: 'alice'
    });
  });
});
