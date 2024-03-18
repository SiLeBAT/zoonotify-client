describe('Page Availability Tests', () => {
  it('Checks if the Explanations page is available', () => {
    cy.visit('http://localhost:8081/explanations');
    cy.url().should('include', '/explanations');
    cy.get('body').should('contain', 'Erläuterungen');
 
    
  });

  it('Checks if the Evaluations page is available', () => {
    cy.visit('http://localhost:8081/evaluations');
    cy.url().should('include', '/evaluations');
    cy.get('body').should('contain', 'Erläuterungen');
   
    
  });

  it('Checks if the Prevalence page is available', () => {
    cy.visit('http://localhost:8081/prevalence');
    cy.url().should('include', '/prevalence');
    cy.get('body').should('contain', 'Prävalenz');
    
  });

  it('Checks if the External Links page is available', () => {
    cy.visit('http://localhost:8081/externallinks');
    cy.url().should('include', '/externallinks');
    cy.get('body').should('contain', 'Externe Links');
    
  });

  it('Checks if the LD page is available', () => {
    cy.visit('http://localhost:8081/ld');
    cy.url().should('include', '/ld');
    cy.get('body').should('contain', 'Linked Data Playground');
    
  });
});
