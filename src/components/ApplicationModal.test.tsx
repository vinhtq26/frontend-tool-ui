import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApplicationModal from './ApplicationModal';

describe('ApplicationModal', () => {
  it('validates and normalizes an application payload', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ApplicationModal open onOpenChange={vi.fn()} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Tên ứng dụng'), '  youtube_tool  ');
    await user.type(screen.getByLabelText('Mô tả'), '  Bản pro  ');
    await user.click(screen.getByRole('button', { name: 'Lưu ứng dụng' }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'youtube_tool', description: 'Bản pro' });
  });

  it('allows clearing the description while editing', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <ApplicationModal
        open
        application={{
          id: 1,
          name: 'youtube_tool',
          description: 'Old description',
          created_at: '2026-08-07 10:00:00',
          updated_at: null
        }}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await user.clear(screen.getByLabelText('Mô tả'));
    await user.click(screen.getByRole('button', { name: 'Lưu ứng dụng' }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'youtube_tool', description: null });
  });
});
