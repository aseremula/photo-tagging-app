import { vi, describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import EndMenu from "../components/EndMenu";
import type { PlayState } from '../types/customTypes';
import { format } from "date-fns";

const apiResponse_Leaderboard = {
    "outcome": "SUCCESS",
    "title": "Leaderboard POST Success",
    "description": "POSTing to the leaderboard successful! Player score and updated leaderboard returned.",
    "data": {
        "playerScore": {
            "id": "99e7da69-090e-44e1-82dd-ba7f9c88f121",
            "name": "Test Player",
            "time": 73721,
            "createdAt": "2025-09-14T17:06:08.719Z",
            "leaderboardId": 3
        },
        "leaderboardScores": {
            "id": 3,
            "levelId": 3,
            "scores": [
                {
                    "id": "962a4f13-dbff-410d-8546-1ae2eb88da97",
                    "name": "Player A",
                    "time": 13360,
                    "createdAt": "2025-09-04T01:46:26.349Z",
                    "leaderboardId": 3
                },
                {
                    "id": "1c15756d-4ad4-4de6-ae1f-afc684a4887b",
                    "name": "Player B",
                    "time": 13460,
                    "createdAt": "2025-09-04T01:46:26.620Z",
                    "leaderboardId": 3
                },
                {
                    "id": "4b46c136-1842-4b7d-b383-3475efe1cd45",
                    "name": "Player C",
                    "time": 14665,
                    "createdAt": "2025-09-04T01:01:53.085Z",
                    "leaderboardId": 3
                }
            ]
        },
        "isPlayerOnLeaderboard": false,
        "playerRank": 51
    }
}

// Set up component's props
const setPlayState: (newPlayState: PlayState) => void = vi.fn();
const levelNumber: number = 1;
const numberOfScores: number = 3;
const playerName: string = "Timmy";
const endTime: number = 5000; // 5 seconds
const setEndTime: (newEndTime: number) => void = vi.fn();

const timeFormat = "mm:ss.SS"; // all scores must be in this format

describe('EndMenu component', () => {
    describe('when leaderboard via backend does load', () => { 
        it('shows rank, names, and formatted scores of the top players', async () => {
            vi.spyOn(window, 'fetch').mockResolvedValue({
            json: () => Promise.resolve(apiResponse_Leaderboard),
            ok: true,
            status: 200,
            } as Response);

            render(
                <EndMenu setPlayState={setPlayState} levelNumber={levelNumber} numberOfScores={numberOfScores} playerName={playerName} endTime={endTime} setEndTime={setEndTime}/>
            );

            // Wait for API data to load before checking leaderboard
            await waitFor(() =>  {
                const leaderboardTable = screen.getAllByRole('table')[1]; // grab second table as first table displays player's score

                expect(within(leaderboardTable).getByText(/#1/i)).toBeInTheDocument();
                expect(within(leaderboardTable).getByText(apiResponse_Leaderboard.data.leaderboardScores.scores[0].name)).toBeInTheDocument();
                expect(within(leaderboardTable).getByText(format(new Date(apiResponse_Leaderboard.data.leaderboardScores.scores[0].time), timeFormat))).toBeInTheDocument();

                expect(within(leaderboardTable).getByText(/#2/i)).toBeInTheDocument();
                expect(within(leaderboardTable).getByText(apiResponse_Leaderboard.data.leaderboardScores.scores[1].name)).toBeInTheDocument();
                expect(within(leaderboardTable).getByText(format(new Date(apiResponse_Leaderboard.data.leaderboardScores.scores[1].time), timeFormat))).toBeInTheDocument();

                expect(within(leaderboardTable).getByText(/#3/i)).toBeInTheDocument();
                expect(within(leaderboardTable).getByText(apiResponse_Leaderboard.data.leaderboardScores.scores[2].name)).toBeInTheDocument();
                expect(within(leaderboardTable).getByText(format(new Date(apiResponse_Leaderboard.data.leaderboardScores.scores[2].time), timeFormat))).toBeInTheDocument();
            });
        });

        it('displays player name, formatted score, and rank as recorded by backend', async () => {
            vi.spyOn(window, 'fetch').mockResolvedValue({
            json: () => Promise.resolve(apiResponse_Leaderboard),
            ok: true,
            status: 200,
            } as Response);

            render(
                <EndMenu setPlayState={setPlayState} levelNumber={levelNumber} numberOfScores={numberOfScores} playerName={playerName} endTime={endTime} setEndTime={setEndTime}/>
            );
                
            // Wait for fetch to succeed before checking for score stats
            await waitFor(() =>  {
                const playerTable = screen.getAllByRole('table')[0]; // grab first table as second table displays leaderboard

                expect(within(playerTable).getByText("#" + apiResponse_Leaderboard.data.playerRank)).toBeInTheDocument();
                expect(within(playerTable).getByText(apiResponse_Leaderboard.data.playerScore.name)).toBeInTheDocument();
                expect(within(playerTable).getByText(format(new Date(apiResponse_Leaderboard.data.playerScore.time), timeFormat))).toBeInTheDocument();
            });
        });
    });

    describe('when leaderboard via backend does not load', () => { 
        it('displays error message instead of leaderboard', async () => {
            vi.spyOn(window, 'fetch').mockResolvedValue({
            json: () => Promise.resolve({}),
            ok: true,
            status: 404, // simulate an error while trying to fetch API data
            } as Response);

            render(
                <EndMenu setPlayState={setPlayState} levelNumber={levelNumber} numberOfScores={numberOfScores} playerName={playerName} endTime={endTime} setEndTime={setEndTime}/>
            );
                
            // Wait for fetch to fail before checking for error message
            await waitFor(() =>  {
                const leaderboardTable = screen.queryAllByRole('table')[1]; // attempt to grab second table as first table displays player stats
                
                expect(leaderboardTable).toBeUndefined();
                expect(screen.getByText(/error/i)).toBeInTheDocument();
            });
        });

        it('displays player name and formatted score, but not rank, as recorded by component', async () => {
            vi.spyOn(window, 'fetch').mockResolvedValue({
            json: () => Promise.resolve({}),
            ok: true,
            status: 404, // simulate an error while trying to fetch API data
            } as Response);

            render(
                <EndMenu setPlayState={setPlayState} levelNumber={levelNumber} numberOfScores={numberOfScores} playerName={playerName} endTime={endTime} setEndTime={setEndTime}/>
            );
                
            // Wait for fetch to fail before checking for score stats
            await waitFor(() =>  {
                const playerTable = screen.getAllByRole('table')[0]; // grab first table as second table displays leaderboard

                expect(within(playerTable).getByText(playerName)).toBeInTheDocument();
                expect(within(playerTable).getByText(format(new Date(endTime), timeFormat))).toBeInTheDocument();
                expect(within(playerTable).getByText(/-/i)).toBeInTheDocument(); // no rank
            });
        });
    });

    it('changes state of play when replay button is clicked', async () => {
        const user = userEvent.setup();
    
        render(
            <EndMenu setPlayState={setPlayState} levelNumber={levelNumber} numberOfScores={numberOfScores} playerName={playerName} endTime={endTime} setEndTime={setEndTime}/>
        );
    
        const replayButton = screen.getByRole('button', { name: /again/i});
        await user.click(replayButton);
            
        expect(setPlayState).toHaveBeenCalled(); // the button's onClick handler should have been called
    });
});