describe('License lifecycle', () => {
  it('creates, assigns, activates and verifies a license', () => {
    cy.loginAsAdmin();

    cy.visit('/licenses');
    cy.contains('button', 'Create License').click();
    cy.get('#duration-days').clear().type('30');
    cy.get('#assign-user').clear().type('alice');
    cy.contains('button', 'Create & Copy').click();

    cy.get('tbody tr').first().find('td').first().invoke('text').as('licenseKey');

    cy.get('@licenseKey').then((key) => {
      const licenseKey = String(key).trim();

      cy.window().then((win) =>
        win.fetch('/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'alice', license_key: licenseKey, hwid: 'hwid-cy-001' })
        })
      );

      cy.window()
        .then((win) =>
          win.fetch('/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'alice', hwid: 'hwid-cy-001' })
          })
        )
        .then(async (response) => {
          const data = await response.json();
          expect(data.valid).to.eq(true);
          expect(data.license_key).to.eq(licenseKey);
        });
    });

    cy.get('input[placeholder="alice"]').clear().type('alice');
    cy.get('tbody tr').first().should('contain.text', 'alice');
  });
});
