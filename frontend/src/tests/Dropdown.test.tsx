import { vi, describe, it, expect } from "vitest";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import Dropdown from "../components/Dropdown";
import type { Coordinates, BubbleDirection, PlayState } from '../types/customTypes';
import type { RefObject } from 'react';

const apiResponse_CorrectGuess = {
  "outcome": "SUCCESS",
  "title": "Gameboard Guess GET Success",
  "description": "Checking the guessed coordinates was successful! Result of guess returned.",
  "data": {
      "imageNumber": "2",
      "isGuessCorrect": true,
      "isGameComplete": false,
      "isImageFoundList": [
          false,
          true,
          false,
          false,
          false
      ]
  }
};

const apiResponse_IncorrectGuess = {
  "outcome": "SUCCESS",
  "title": "Gameboard Guess GET Success",
  "description": "Checking the guessed coordinates was successful! Result of guess returned.",
  "data": {
      "imageNumber": "2",
      "isGuessCorrect": false,
      "isGameComplete": false,
      "isImageFoundList": [
          false,
          true,
          false,
          false,
          false
      ]
  }
};

// Set up component's props
const imageSet: boolean[] = [];
const setImageSet: (newImageSet: boolean[]) => void = vi.fn();
const bubbleDirection: BubbleDirection = "right";
const setPlayState: (newPlayState: PlayState) => void = vi.fn();
const setShowDropdown: (newShowDropdown: boolean) => void = vi.fn();
const dropdownTimeoutRef: RefObject<ReturnType<typeof setTimeout>> = { current: 0 };
const correctGuessCoordinates: Coordinates[] = [];
const setCorrectGuessCoordinates: (newCorrectGuessCoordinates: Coordinates[]) => void = vi.fn();

describe('Dropdown component', () => {
  it('informs user when a guess is correct', async () => {
    // Set up component's props specific to test (clicking correct spot on gameboard)
    const coordinates: Coordinates = { pageX: 769, pageY: 242, standardX: 6419, standardY: 2852 };

    // Simulate user interactions & mock API call where the user's guess is correct
    const user = userEvent.setup();

    vi.spyOn(window, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(apiResponse_CorrectGuess),
      ok: true,
      status: 200,
    } as Response);

    render(
      <Dropdown imageSet={imageSet} setImageSet={newImageSet => setImageSet(newImageSet)} bubbleDirection={bubbleDirection} setPlayState={newPlayState => setPlayState(newPlayState)} setShowDropdown={newShowDropdown => setShowDropdown(newShowDropdown)} dropdownTimeoutRef={dropdownTimeoutRef} coordinates={coordinates} correctGuessCoordinates={correctGuessCoordinates} setCorrectGuessCoordinates={newCorrectGuessCooordinates => setCorrectGuessCoordinates(newCorrectGuessCooordinates)}/>
    );

    // Click image button to submit guess to backend API
    const imageButton = screen.getByRole('button', { name: /2/i});
    await user.click(imageButton);
        
    // Wait for API data to load before checking if guess is correct
    await waitFor(() =>  {
      expect(screen.getByRole("paragraph").textContent).toMatch("correct");
      expect(imageButton).toBeDisabled();
    });
  });

  it('informs user when a guess is incorrect', async () => {
    // Set up component's props specific to test (clicking incorrect spot on gameboard)
    const coordinates: Coordinates = { pageX: 1012, pageY: 245, standardX: 8447, standardY: 2888 };

    // Simulate user interactions & mock API call where the user's guess is incorrect
    const user = userEvent.setup();
    vi.spyOn(window, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(apiResponse_IncorrectGuess),
      ok: true,
      status: 200,
    } as Response);

    render(
      <Dropdown imageSet={imageSet} setImageSet={newImageSet => setImageSet(newImageSet)} bubbleDirection={bubbleDirection} setPlayState={newPlayState => setPlayState(newPlayState)} setShowDropdown={newShowDropdown => setShowDropdown(newShowDropdown)} dropdownTimeoutRef={dropdownTimeoutRef} coordinates={coordinates} correctGuessCoordinates={correctGuessCoordinates} setCorrectGuessCoordinates={newCorrectGuessCooordinates => setCorrectGuessCoordinates(newCorrectGuessCooordinates)}/>
    );

    // Click image to submit guess to backend API
    const imageButton = screen.getByRole('button', { name: /2/i});
    await user.click(imageButton);
        
    // Wait for API data to load before checking if guess is incorrect
    await waitFor(() =>  {
      expect(screen.getByRole("paragraph").textContent).toMatch("incorrect");
      expect(imageButton).not.toBeDisabled();
    });
  });

  it('informs user when a guess is loading', async () => {
    // Set up component's props specific to test (clicking a spot on gameboard)
    const coordinates: Coordinates = { pageX: 1012, pageY: 245, standardX: 8447, standardY: 2888 };

    // Simulate user interactions & mock API call where the result of the user's guess is loading
    const user = userEvent.setup();
    vi.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {})); // as promise never resolves/rejects, it hangs indefinitely and simulates loading the result of the user's guess

    render(
      <Dropdown imageSet={imageSet} setImageSet={newImageSet => setImageSet(newImageSet)} bubbleDirection={bubbleDirection} setPlayState={newPlayState => setPlayState(newPlayState)} setShowDropdown={newShowDropdown => setShowDropdown(newShowDropdown)} dropdownTimeoutRef={dropdownTimeoutRef} coordinates={coordinates} correctGuessCoordinates={correctGuessCoordinates} setCorrectGuessCoordinates={newCorrectGuessCooordinates => setCorrectGuessCoordinates(newCorrectGuessCooordinates)}/>
    );

    // Click image to submit guess to backend API
    const imageButton = screen.getByRole('button', { name: /2/i});
    await user.click(imageButton);
        
    // Check if result of user's guess is loading
    await waitFor(() =>  {
      expect(screen.getByRole("paragraph").textContent).toMatch("loading");
      expect(imageButton).not.toBeDisabled();
    });
  });
});