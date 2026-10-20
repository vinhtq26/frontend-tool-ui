import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuotaLimitModal from './QuotaLimitModal';
import type { License } from '../types';

const license: License = {
  id: 12,
  license_key: 'KEY-12',
  owner_id: 5,
  hwid: null,
  is_active: true,
  duration_days: 30,
  expiry_date: null,
  last_check: null,
  custom_monthly_limit: null,
  usage: { plan: 'free', plan_expiry: null, period: '2026-10', used: 3, limit: 30, remaining: 27 }
};

describe('QuotaLimitModal', () => {
  it('sets a custom limit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<QuotaLimitModal open license={license} onOpenChange={vi.fn()} onSubmit={onSubmit} />);

    await user.click(screen.getByText('Giới hạn riêng (video/tháng)'));
    const input = screen.getByLabelText('Giới hạn riêng');
    await user.clear(input);
    await user.type(input, '50');
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(onSubmit).toHaveBeenCalledWith(50);
  });

  it('clears the override with null', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <QuotaLimitModal open license={{ ...license, custom_monthly_limit: 50 }} onOpenChange={vi.fn()} onSubmit={onSubmit} />
    );

    expect(screen.getByLabelText('Giới hạn riêng')).toHaveValue(50);
    await user.click(screen.getByText('Theo cấu hình chung'));
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(onSubmit).toHaveBeenCalledWith(null);
  });
});
