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
  custom_daily_limit: null,
  usage: {
    plan: 'free', plan_expiry: null, period: '2026-10', used: 3, limit: 30, remaining: 27,
    daily_period: '2026-10-20', daily_used: 1, daily_limit: 10, daily_remaining: 9
  }
};

describe('QuotaLimitModal', () => {
  it('sends only the changed monthly limit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<QuotaLimitModal open license={license} onOpenChange={vi.fn()} onSubmit={onSubmit} />);

    await user.click(screen.getAllByText('Giới hạn riêng')[0]);
    const input = screen.getByLabelText('Giới hạn tháng riêng');
    await user.clear(input);
    await user.type(input, '50');
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(onSubmit).toHaveBeenCalledWith({ monthly_limit: 50 });
  });

  it('clears only the daily override with null', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <QuotaLimitModal
        open
        license={{ ...license, custom_monthly_limit: 50, custom_daily_limit: 5 }}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByLabelText('Giới hạn ngày riêng')).toHaveValue(5);
    await user.click(screen.getAllByText('Theo cấu hình chung')[1]);
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(onSubmit).toHaveBeenCalledWith({ daily_limit: null });
  });
});
