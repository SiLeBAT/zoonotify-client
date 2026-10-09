import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

// The first test in a file renders cold (module init, MUI/emotion style setup).
// When the full suite runs in parallel — as the husky pre-commit hook does —
// that first mocked fetch can take longer than testing-library's 1000ms default
// to reach the DOM, so waitFor/findBy gave up while the loading spinner was
// still showing. Failures there are timing, not behaviour.
configure({ asyncUtilTimeout: 5000 });

// jest.setup.js
HTMLCanvasElement.prototype.getContext = () => ({
    // Mock whatever functions you use, like measureText, fillText, etc.
    // This is an example and might need to be adjusted based on actual usage.
    measureText: () => ({ width: 100 }),
    fillText: jest.fn(),
    drawImage: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawFocusIfNeeded: jest.fn(),
    save: jest.fn(),
    fill: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    clearRect: jest.fn(),
    clip: jest.fn(),
    rect: jest.fn(),
    restore: jest.fn(),
    save: jest.fn(),
    fillStyle: jest.fn(),
    strokeStyle: jest.fn(),
    lineWidth: jest.fn(),
    setLineDash: jest.fn(),
    getLineDash: jest.fn(),
    measureText: jest.fn(),
    strokeText: jest.fn(),
    fillText: jest.fn(),
    bezierCurveTo: jest.fn(),
    canvas: jest.fn(),
});

require("jest-canvas-mock");
