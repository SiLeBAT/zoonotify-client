import * as React from 'react';
import { sum } from './sum';

interface AppProps {
    name: string;
}
export default function ({ name }: AppProps) {
    return <h1>{name}</h1>;
}
