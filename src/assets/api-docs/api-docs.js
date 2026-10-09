/* global SwaggerUIBundle */
// Initializer for the static API reference page (index.html beside it). Kept
// in its own file rather than inline so the page needs no 'unsafe-inline'.
window.ui = SwaggerUIBundle({
    url: "./openapi.json",
    dom_id: "#swagger-ui",
    presets: [SwaggerUIBundle.presets.apis],
    layout: "BaseLayout",
    deepLinking: true,
    tryItOutEnabled: true,
    // Don't send the spec to swagger.io's online validator.
    validatorUrl: null,
});
