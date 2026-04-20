import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { TestProviders } from '../test/test-utils';

describe('Login form', () => {
  it('shows inline validation when fields are empty', async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <Login />
      </TestProviders>
    );

    await user.clear(screen.getByLabelText('Username'));
    await user.clear(screen.getByLabelText('Password'));
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Username and password are required')).toBeInTheDocument();
  });
});
