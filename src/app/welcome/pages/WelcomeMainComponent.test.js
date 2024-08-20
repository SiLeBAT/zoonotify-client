// WelcomeMainComponent.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { WelcomeMainComponent } from './WelcomeMainComponent';
import { useWelcomePageComponent } from './welcomeUseCase';

// Mock the useWelcomePageComponent hook
jest.mock('./welcomeUseCase', () => ({
    useWelcomePageComponent: jest.fn()
}));

// Mock the Markdown component
jest.mock('markdown-to-jsx', () => ({ children }) => <div>{children}</div>);

// Mock the LogoCardComponent
jest.mock('../../shared/components/logo_card/LogoCard.component', () => ({
    LogoCardComponent: (props) => <div data-testid="logoCard">{props.title} - {props.subtitle} - {props.text}</div>
}));

// Mock the PageLayoutComponent
jest.mock('../../shared/components/layout/PageLayoutComponent', () => ({
    PageLayoutComponent: ({ children }) => <div>{children}</div>
}));

describe('WelcomeMainComponent', () => {
    it('renders correctly with given model data', () => {
        const mockModel = {
            subtitle: 'Discover Microbial Data',
            content: 'Welcome to ZooNotify!'
        };

        // Mock the use case to return the expected model
        useWelcomePageComponent.mockReturnValue({ model: mockModel });

        render(<WelcomeMainComponent />);

        // Use screen.debug to print the DOM tree
        screen.debug();

        const logoCardProps = screen.getByTestId('logoCard').textContent;
        expect(logoCardProps).toContain('Discover Microbial Data');
        expect(logoCardProps).toContain('Welcome to ZooNotify!');
    });
});
