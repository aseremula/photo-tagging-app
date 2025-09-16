import { describe, it, expect } from "vitest";
import { render, screen } from '@testing-library/react';
import App from '../App.tsx';

describe('App component', () => {
  it('shows game if device is compatible', () => {
    // Change size of window to imitate playing on a device with a large screen
    Object.defineProperty(window, 'innerWidth', {writable: true, configurable: true, value: 800});

    render(
      <App/>
    );

    const startMenuHeading = screen.getByRole('heading', { name: /instructions/i });
    expect(startMenuHeading).toBeVisible();  
  });

  it('shows rotation message if device is compatible after orientation change', () => {
    // Change size of window to imitate playing on a device with a large screen only on a certain orientation
    Object.defineProperty(window, 'innerWidth', {writable: true, configurable: true, value: 200});

    render(
      <App/>
    );

    const startMenuHeading = screen.queryByRole('heading', { name: /instructions/i });
    expect(startMenuHeading).toBeNull();  
    expect(screen.getByText(/rotate your device/i)).toBeInTheDocument();  
  });

  it('shows error message if device is not compatible regardless of orientation', () => {
    // Change size of window to imitate playing on a device with a small/incompatible screen
    Object.defineProperty(window, 'innerWidth', {writable: true, configurable: true, value: 20});
    Object.defineProperty(window, 'innerHeight', {writable: true, configurable: true, value: 20});

    render(
      <App/>
    );

    const startMenuHeading = screen.queryByRole('heading', { name: /instructions/i });
    expect(startMenuHeading).toBeNull();
    expect(screen.getByText(/incompatible device/i)).toBeInTheDocument();  
  });
});