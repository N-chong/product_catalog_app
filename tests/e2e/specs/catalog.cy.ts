describe('Product Catalog', () => {
  it('opens the dashboard and navigates to the catalog', () => {
    cy.visit('/');
    cy.contains('h1', 'Everything in one simple catalog.');
    cy.contains('ion-button', 'View products').click();
    cy.url().should('include', '/products');
    cy.contains('h1', 'Product catalog');
  });
});
