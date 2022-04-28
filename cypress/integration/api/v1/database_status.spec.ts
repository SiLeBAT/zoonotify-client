/// <reference types="Cypress" />

describe("Testing the /database/status endpoint", function () {
    const baseUrl = "http://localhost:3000/v1/database/status";
    describe("GET", function () {
        const method = "GET";
        it("should respond with 200", function () {
            cy.request({
                method: method,
                log: true,
                url: baseUrl,
                headers: {
                    accept: "application/json",
                },
            }).then(
                (response) => {
                    expect(response.status).to.be.equal(200);
                    expect(response.body.date).to.be.a("string");
                }
            );
        });
    });
});
