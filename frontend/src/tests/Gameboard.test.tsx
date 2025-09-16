import { vi, describe, it, expect } from "vitest";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import Gameboard from "../components/Gameboard";
import type { Coordinates, PlayState } from '../types/customTypes';

// Set up component's props
const imageSet: boolean[] = [];
const setImageSet: (newImageSet: boolean[]) => void = vi.fn()
const setPlayState: (newPlayState: PlayState) => void = vi.fn();
const correctGuessCoordinates: Coordinates[] = [];
const setCorrectGuessCoordinates: (newCorrectGuessCoordinates: Coordinates[]) => void = vi.fn();

describe('Gameboard component', () => {
    it('shows dropdown menu when image is clicked', async () => {
        const playState: PlayState = "gameboard_guessing";
        const user = userEvent.setup();

        render(
            <Gameboard imageSet={imageSet} setImageSet={setImageSet} playState={playState} setPlayState={setPlayState} correctGuessCoordinates={correctGuessCoordinates} setCorrectGuessCoordinates={setCorrectGuessCoordinates}/>
        );

        // click on image to show Dropdown component
        const gameboardImage = screen.getByRole('img', { name: /pixorama/i });
        await user.click(gameboardImage);

        // the dropdown menu has buttons for the user to submit their guesses
        expect(screen.getByRole('button', { name: /person 1/i})).toBeVisible();
    });

    it('blurs the image when not in play', () => {
        const playState: PlayState = "start_menu";

        render(
            <Gameboard imageSet={imageSet} setImageSet={setImageSet} playState={playState} setPlayState={setPlayState} correctGuessCoordinates={correctGuessCoordinates} setCorrectGuessCoordinates={setCorrectGuessCoordinates}/>
        );

        const gameboardImage = screen.getByRole('img', { name: /pixorama/i });
        expect(gameboardImage).toHaveClass(/blur/i);
    });
});