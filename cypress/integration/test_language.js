describe("Test langugae setting in local storage", function () {
    it("check english language storage", function () {
        cy.visit("https://nolar-dev.bfr.berlin/");
        cy.get(".css-447cbc-TranslationButtonsComponent")
            .click()
            .should(() => {
                expect(localStorage.getItem("i18nextLng")).to.eq("en");
            });
    });
    it("check german language storage", function () {
        cy.visit("https://nolar-dev.bfr.berlin/");
        cy.get(".css-w5uhs5-TranslationButtonsComponent")
            .click()
            .should(() => {
                expect(localStorage.getItem("i18nextLng")).to.eq("de");
            });
    });
});
