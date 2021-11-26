// This file just exists so we can have a test example.  Test and function are useless otherwise.
export const sum = (...a: number[]): number =>
    a.reduce((acc, val) => acc + val, 0);
