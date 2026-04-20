import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LicenseTable from './LicenseTable';

const sample = [
  {
    license_key: 'ABC-123',
    owner_id: 1,
    owner_username: 'alice',
    hwid: 'hwid-1',
    is_active: true,
    duration_days: 30,
    expiry_date: '2026-05-16T12:34:56Z',
    last_check: '2026-04-16T12:00:00Z'
  }
];

describe('LicenseTable', () => {
  it('renders required columns and row', () => {
    render(
      <LicenseTable
        licenses={sample}
        onView={vi.fn()}
        onAssign={vi.fn()}
        onRevoke={vi.fn()}
        onRenew={vi.fn()}
      />
    );

    expect(screen.getByText('License key')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('HWID')).toBeInTheDocument();
    expect(screen.getByText('ABC-123')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('calls action handlers from row menu', async () => {
    const user = userEvent.setup();
    const onAssign = vi.fn();
    render(
      <LicenseTable
        licenses={sample}
        onView={vi.fn()}
        onAssign={onAssign}
        onRevoke={vi.fn()}
        onRenew={vi.fn()}
      />
    );

    await user.click(screen.getAllByRole('button')[0]);
    await user.click(screen.getAllByText('Assign')[0]);

    expect(onAssign).toHaveBeenCalledTimes(1);
  });
});
