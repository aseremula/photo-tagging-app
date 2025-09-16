import { vi, describe, it, expect } from "vitest";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import StartMenu from "../components/StartMenu";
import type { PlayState } from '../types/customTypes';

const apiResponse_InvalidName = {
    "outcome": "FAILURE",
    "title": "Validation Check Failure",
    "description": "The validation check failed because the data given was not valid.",
    "data": {
        "isValidName": false,
        "name": "ilikegames99",
        "startTime": 0,
        "errors": [
            {
                "type": "field",
                "value": "ilikegames99",
                "msg": {
                    "category": "name",
                    "description": "Name can only contain letters."
                },
                "path": "name",
                "location": "body"
            }
        ]
    }
};

const apiResponse_BlankName = {
    "outcome": "FAILURE",
    "title": "Validation Check Failure",
    "description": "The validation check failed because the data given was not valid.",
    "data": {
        "isValidName": false,
        "name": "",
        "startTime": 0,
        "errors": [
            {
                "type": "field",
                "value": "",
                "msg": {
                    "category": "name",
                    "description": "Name is required."
                },
                "path": "name",
                "location": "body"
            }
        ]
    }
};

const apiResponse_ValidName = {
    "outcome": "SUCCESS",
    "title": "Validation Check Success",
    "description": "Validation check successful! Name provided is valid - timer now activated.",
    "data": {
        "isValidName": true,
        "name": "ilikegames",
        "startTime": 1757188576858
    }
};

// Set up component's props
const setPlayState: (newPlayState: PlayState) => void = vi.fn();
const playerName: string = "Timmy";
const setPlayerName: (newPlayerName: string) => void = vi.fn();
const setStartTime: (newStartTime: number) => void  = vi.fn();

describe('StartMenu component', () => {
  it('displays error message when user enters an invalid name', async () => {
    // Simulate user interactions & mock API call where the user-entered name is invalid
    const user = userEvent.setup();
    vi.spyOn(window, 'fetch').mockResolvedValue({
        json: () => Promise.resolve(apiResponse_InvalidName),
        ok: true,
        status: 200,
    } as Response);

    render(
      <StartMenu setPlayState={setPlayState} playerName={playerName} setPlayerName={setPlayerName} setStartTime={setStartTime}/>
    );

    // Skip entering a name into the input field as the API call is mocked and an invalid name was already pre-selected 
    const submitButton = screen.getByRole('button', { name: /start/i });
    await user.click(submitButton);
        
    // Wait for API data to load before checking if input was invalid
    await waitFor(() =>  {
      expect(screen.getByText(/can only contain/i)).toBeInTheDocument();
    });
  });

  it('displays error message when user keeps input form blank', async () => {
    // Simulate user interactions & mock API call where the user-entered name is invalid
    const user = userEvent.setup();
    vi.spyOn(window, 'fetch').mockResolvedValue({
        json: () => Promise.resolve(apiResponse_BlankName),
        ok: true,
        status: 200,
    } as Response);

    render(
      <StartMenu setPlayState={setPlayState} playerName={playerName} setPlayerName={setPlayerName} setStartTime={setStartTime}/>
    );

    // Skip entering a name into the input field as the API call is mocked and an invalid name was already pre-selected 
    const submitButton = screen.getByRole('button', { name: /start/i });
    await user.click(submitButton);
        
    // Wait for API data to load before checking if input was invalid
    await waitFor(() =>  {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('changes state of play when user enters a valid name', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'fetch').mockResolvedValue({
        json: () => Promise.resolve(apiResponse_ValidName),
        ok: true,
        status: 200,
    } as Response);

    render(
        <StartMenu setPlayState={setPlayState} playerName={playerName} setPlayerName={setPlayerName} setStartTime={setStartTime}/>
    );
      
    const submitButton = screen.getByRole('button', { name: /start/i });
    await user.click(submitButton);
      
    await waitFor(() =>  {
        expect(setPlayState).toHaveBeenCalled(); // a valid input means the menu can close and the game can begin
    });
  });
});