/// <reference types="Cypress" />

describe("Testing the /isolate/counted endpoint", function () {
    const baseUrl = "http://localhost:3000/v1/isolate/counted";
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
                expect(response.body.totalNumberOfIsolates).to.be.a("number");
                expect(response.body.groups).to.be.empty;
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
            it(`should have ${element} as key`, function () {
                cy.request({
                    method: method,
                    log: true,
                    url: baseUrl + "/?group-by=" + element,
                    headers: {
                        accept: "application/json",
                    },
                }).then((response) => {
                    expect(response.status).to.be.equal(200);
                    expect(response.body.totalNumberOfIsolates).to.be.a(
                        "number"
                    );
                    expect(response.body.groups).to.be.a("array");
                    expect(response.body.groups[0].count).to.be.a("number");
                    expect(response.body.groups[0][element]).to.be.a("string");
                });
            });
        });
        it(`should be grouped by two elements`, function () {
            cy.request({
                method: method,
                log: true,
                url: baseUrl + "/?group-by=microorganism&group-by=samplingYear",
                headers: {
                    accept: "application/json",
                },
            }).then((response) => {
                expect(response.status).to.be.equal(200);
                expect(response.body.totalNumberOfIsolates).to.be.a("number");
                expect(response.body.groups).to.be.a("array");
                expect(response.body.groups[0].count).to.be.a("number");
                expect(response.body.groups[0].microorganism).to.be.a("string");
                expect(response.body.groups[0].samplingYear).to.be.a("string");
            });
        });
    });
});
