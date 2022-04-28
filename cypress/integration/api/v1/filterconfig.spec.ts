/// <reference types="Cypress" />

describe("Testing the /filterconfig endpoint", function () {
    const baseUrl = "http://localhost:3000/v1/filterconfig";
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
            }).then((response) => {
                expect(response.status).to.be.equal(200);
                expect(response.body.filters).to.be.a("array");
            });
        });
        [
            "microorganism",
            "samplingYear",
            "samplingContext",
            "origin",
            "samplingStage",
            "category",
            "productionType",
            "matrix",
            "federalState",
        ].forEach((element) => {
            it(`filterconfig of ${element} should include "id" and "values" as keys`, function () {
                cy.request({
                    method: method,
                    log: true,
                    url: baseUrl + "/" + element,
                    headers: {
                        accept: "application/json",
                    },
                }).then((response) => {
                    expect(response.status).to.be.equal(200);
                    expect(response.body.filters).to.be.a("array");
                    expect(response.body.filters[0]).to.be.a("object");
                    expect(response.body.filters[0].id).to.be.a("string");
                    expect(response.body.filters[0].values).to.be.a("array");
                    expect(response.body.filters[0].parent).to.be.a(
                        "undefined"
                    );
                    expect(response.body.filters[0].trigger).to.be.a(
                        "undefined"
                    );
                });
            });
        });
        [
            "serovar",
            "carba_ampc_carba_phenotype",
            "esbl_ampc_carba_phenotype",
            "campy_spez",
            "entero_spez",
            "spa_type",
            "serotype",
            "clonal_group",
            "o_group",
            "h_group",
            "matrixDetail__Blinddarminhalt",
            "matrixDetail__Frisches Fleisch",
            "matrixDetail__Haut",
            "matrixDetail__Kot",
            "matrixDetail__Kot / Staub",
            "matrixDetail__Rohmilchkäse",
            "matrixDetail__Streichfähige Rohwürste",
            "matrixDetail__Ölsaaten / Ölfruchte und Extraktionsschrote",
        ].forEach((element) => {
            it(`filterconfig of ${element} should include "id", "values", "parent" and "trigger" as keys`, function () {
                cy.request({
                    method: method,
                    log: true,
                    url: baseUrl + "/" + element,
                    headers: {
                        accept: "application/json",
                    },
                }).then((response) => {
                    expect(response.status).to.be.equal(200);
                    expect(response.body.filters).to.be.a("array");
                    expect(response.body.filters[0]).to.be.a("object");
                    expect(response.body.filters[0].id).to.be.a("string");
                    expect(response.body.filters[0].values).to.be.a("array");
                    expect(response.body.filters[0].parent).to.be.a("string");
                    expect(response.body.filters[0].trigger).to.be.a("string");
                });
            });
        });
    });
});
