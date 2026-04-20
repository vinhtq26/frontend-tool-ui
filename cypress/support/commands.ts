Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/login');
  cy.get('#login-username').clear().type('ops-admin');
  cy.get('#login-password').clear().type('password123');
  cy.contains('button', 'Sign in').click();
  cy.url().should('include', '/dashboard');
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>;
    }
  }
}

export {};
