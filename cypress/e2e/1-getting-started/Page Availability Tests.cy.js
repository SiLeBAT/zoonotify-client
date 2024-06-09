describe('Page Availability Tests', () => {
  it('Checks if the Explanations page is available', () => {
    cy.visit(Cypress.env('BASE_URL') + '/explanations');
    cy.url().should('include', '/explanations');
    cy.get('body').should('contain', 'Erläuterungen');
  });

  it('Checks if the Evaluations page is available', () => {
    cy.visit(Cypress.env('BASE_URL') + '/evaluations');
    cy.url().should('include', '/evaluations');
    cy.get('body').should('contain', 'Erläuterungen');
  });

  it('Checks if the Prevalence page is available', () => {
    cy.visit(Cypress.env('BASE_URL') + '/prevalence');
    cy.url().should('include', '/prevalence');
    cy.get('body').should('contain', 'Prävalenz');
  });

  it('Checks if the External Links page is available', () => {
    cy.visit(Cypress.env('BASE_URL') + '/links');
    cy.url().should('include', '/links');
    cy.get('body').should('contain', 'Externe Links');
  });

  it('Checks if the LD page is available', () => {
    cy.visit(Cypress.env('BASE_URL') + '/ld');
    cy.url().should('include', '/ld');
    cy.get('body').
should('contain', 'Linked Data Playground');
});

it('Checks if the Data Protection Declaration page is available', () => {
  cy.visit(Cypress.env('BASE_URL') + '/dataProtectionDeclaration');
  cy.url().should('include', '/dataProtectionDeclaration');
  cy.get('body').
should('contain', 'Datenschutzerklärung');
});
});