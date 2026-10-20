import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuotaSettingsCard from './QuotaSettingsCard';
import { TestProviders } from '../test/test-utils';
import { getQuotaSettings, updateQuotaSettings } from '../services/usage';

vi.mock('../services/usage', () => ({
  getQuotaSettings: vi.fn(),
  updateQuotaSettings: vi.fn()
}));

describe('QuotaSettingsCard', () => {
  it('sends only the changed field', async () => {
    vi.mocked(getQuotaSettings).mockResolvedValue({ free_monthly_downloads: 30, pro_monthly_downloads: 100 });
    vi.mocked(updateQuotaSettings).mockResolvedValue({ free_monthly_downloads: 50, pro_monthly_downloads: 100 });
    const user = userEvent.setup();
    render(<QuotaSettingsCard />, { wrapper: TestProviders });

    const free = await screen.findByDisplayValue('30');
    await user.clear(free);
    await user.type(free, '50');
    await user.click(screen.getByRole('button', { name: 'Lưu giới hạn' }));

    expect(vi.mocked(updateQuotaSettings).mock.calls[0][0]).toEqual({ free_monthly_downloads: 50 });
  });

  it('does not submit when nothing changed', async () => {
    vi.mocked(getQuotaSettings).mockResolvedValue({ free_monthly_downloads: 30, pro_monthly_downloads: 100 });
    vi.mocked(updateQuotaSettings).mockClear();
    const user = userEvent.setup();
    render(<QuotaSettingsCard />, { wrapper: TestProviders });

    await screen.findByDisplayValue('30');
    await user.click(screen.getByRole('button', { name: 'Lưu giới hạn' }));

    expect(screen.getByText('Không có thay đổi nào để lưu.')).toBeInTheDocument();
    expect(updateQuotaSettings).not.toHaveBeenCalled();
  });
});
