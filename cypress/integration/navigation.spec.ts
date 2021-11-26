/// <reference types="Cypress" />

describe("Test navigation", function () {
    it("check navigation on ZN", function () {
        cy.visit("https://nolar-dev.bfr.berlin/");
        cy.contains("Abfrage").click();
        cy.url().should("include", "/query");
        cy.contains("ZooNotify").click();
        cy.url().should("include", "/");
        cy.contains("Erläuterungen").click();
        cy.url().should("include", "/explanations");
        cy.contains("Datenschutz").click();
        cy.url().should("include", "/dataProtectionDeclaration");
    });
    it("check external links ", function () {
        cy.get('a[href="https://www.bfr.bund.de/de/start.html"]').should(
            "have.attr",
            "target",
            "_blank"
        );
        cy.get(
            'a[href="https://foodrisklabs.bfr.bund.de/foodrisk-labs/"]'
        ).should("have.attr", "target", "_blank");
        cy.get('a[href="/api-docs/v1/"]').should(
            "have.attr",
            "target",
            "_blank"
        );
    });
});
