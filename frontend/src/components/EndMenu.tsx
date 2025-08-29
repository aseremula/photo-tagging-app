import { useState, useEffect } from 'react';
import { format } from "date-fns";
// import type { Dispatch, SetStateAction } from 'react'; // For testing localhost only
import type { PlayState } from '../types/customTypes';
import { fetchApi, type AvailableMethods, type HostType } from '../functions/fetchApi';

type ApiError = string | null;
type Score = { id: string, name: string, time: string, leaderboardId: number };
interface ApiLeaderboardResponse {
    isPlayerOnLeaderboard: boolean;
    leaderboardScores: {
        id: number;
        levelId: number;
        scores: Score[];
    };
    playerRank: number;
    playerScore: {
        id: string;
        leaderboardId: number;
        name: string;
        time: string;
    };
};
type LeaderboardInfo = ApiLeaderboardResponse | null;

type EndMenuComponentProps = {
    setPlayState: (newPlayState: PlayState) => void;
    // setPlayState: Dispatch<SetStateAction<PlayState>>; // For testing localhost only
    levelNumber: number;
    numberOfScores: number;
    playerName: string;
    endTime: number;
    setEndTime: (newEndTime: number) => void;
    // setEndTime: Dispatch<SetStateAction<number>>; // For testing localhost only
}

function EndMenu({ setPlayState, levelNumber, numberOfScores, playerName, endTime, setEndTime } : EndMenuComponentProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<ApiError>(null);
    const [LeaderboardInfo, setLeaderboardInfo] = useState<LeaderboardInfo>(null);
    const timeFormat = "mm:ss.SS";

    useEffect(() => {
        const outcomes = {
            SUCCESS: "SUCCESS",
            FAILURE: "FAILURE",
        };
    
        async function getLeaderboard() 
        {
            try
            {
                const path = `/leaderboards?numberOfScores=${numberOfScores}`;
                const hostType: HostType = "web";
                const method: AvailableMethods = "POST";
                const body = { 
                    levelNumber: levelNumber, 
                };
          
                const response = await fetchApi(hostType, path, method, body);
                if(response)
                {
                    if(response.outcome === outcomes.FAILURE)
                    {
                        setLeaderboardInfo(null);
                    }
                    else if(response.outcome === outcomes.SUCCESS)
                    {
                        setLeaderboardInfo(response.data);
                        setEndTime(response.data.playerScore.time);
                    }
                    setError(null);
                }
            }
            catch(error)
            {
                if(error instanceof Error) 
                {
                    setError(error.message);
                }
                else
                {
                    setError("An unknown error has occured.");
                }
            }
            finally
            {
                setIsLoading(false);
            }
        }
        setIsLoading(true);
        getLeaderboard(); 
    }, [levelNumber, numberOfScores, playerName, setEndTime]);

  return (
    <section className="menuEnter min-w-115 max-w-115 font-(family-name:--roboto-400) text-(--black) text-xl bg-(--tan) border-1 border-(--aqua) border-dashed overflow-y-auto max-h-[78vh] lg:max-xl:text-lg xl:max-2xl:text-lg">
        <h3 className="font-(family-name:--bodoni-400) italic text-5xl text-(--light-red) p-3 py-6 bg-(--neon-yellow) border-b-(--aqua) border-b-1 border-dashed lg:max-xl:text-3xl lg:max-xl:py-4 xl:max-2xl:text-4xl xl:max-2xl:p-5">Results</h3>
       
        <div className="p-3">
            <table className="table-auto border-collapse w-[100%]">
                <caption className="text-left font-bold text-(--gray)">Your Score</caption>
                <thead>
                    <tr>
                        <th scope="col" className="text-(--aqua) italic text-xs text-center px-3 pt-3">Position</th>
                        <th scope="col" className="text-(--aqua) italic text-xs text-left px-3 pt-3">User</th>
                        <th scope="col" className="text-(--aqua) italic text-xs text-left px-3 pt-3">Time</th>
                    </tr>
                </thead>
                <tbody className="border-1 border-(--black)">
                    <tr className="bg-(--white)">
                        <th scope="row" className="p-3 text-center lg:max-xl:p-2">{(isLoading || LeaderboardInfo === null) ? "-" : `#${LeaderboardInfo.playerRank}`}</th>
                        <td className={`p-3 font-(family-name:--bodoni-400) hyphens-auto wrap-anywhere italic text-left lg:max-xl:p-2 w-[100%] ${LeaderboardInfo && LeaderboardInfo.isPlayerOnLeaderboard && "text-(--light-red)"}`}>{(isLoading || LeaderboardInfo === null) ? playerName : LeaderboardInfo.playerScore.name}</td>
                        
                        {/* Set API/backend time if API call was successful, otherwise display Stopwatch time */}
                        <td className={`p-3 text-right lg:max-xl:p-2 ${LeaderboardInfo && LeaderboardInfo.isPlayerOnLeaderboard && "text-(--light-red)"}`}>{(isLoading) ? "--" : (LeaderboardInfo === null) ? format(new Date(endTime), timeFormat) : format(new Date(LeaderboardInfo.playerScore.time), timeFormat)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

       {(isLoading) ? 
        <div className="p-3 text-center">
            <p className="font-bold text-(--gray) loadingScreenText">Grabbing leaderboard...</p>
        </div> 
       :
        ((error || LeaderboardInfo === null) ?
            <div className="p-3 text-center">
                <p className="text-3xl lg:max-xl:text-xl xl:max-2xl:text-2xl">⚠️ ✋ 🤔</p>
                <p>There was an error grabbing the leaderboard.</p>
            </div>
        :
            <div className="p-3">
                <table className="table-auto border-collapse w-[100%]">
                    <caption className="text-left font-bold text-(--gray)">Leaderboard</caption>
                    <thead>
                        <tr>
                            <th scope="col" className="text-(--aqua) italic text-xs text-center px-3 pt-3">Position</th>
                            <th scope="col" className="text-(--aqua) italic text-xs text-left px-3 pt-3">User</th>
                            <th scope="col" className="text-(--aqua) italic text-xs text-left px-3 pt-3">Time</th>
                        </tr>
                    </thead>
                    <tbody className="border-1 border-(--black)">
                        {LeaderboardInfo.leaderboardScores.scores.map((score, index) => (
                        <tr key={score.id} className="odd:bg-white even:bg-(--off-white)">
                            <th scope="row" className="p-3 text-center lg:max-xl:p-2">#{index+1}</th>
                            <td className={`p-3 font-(family-name:--bodoni-400) hyphens-auto wrap-anywhere italic text-left w-[100%] lg:max-xl:p-2 ${score.id === LeaderboardInfo.playerScore.id && "text-(--light-red)"}`}>{score.name}</td>
                            <td className={`p-3 text-right lg:max-xl:p-2 ${score.id === LeaderboardInfo.playerScore.id && "text-(--light-red)"}`}>{format(new Date(score.time), timeFormat)}</td>
                        </tr>))}
                    </tbody>
                </table>
            </div>)
        }

        <button className="flex gap-1 items-center justify-center font-(family-name:--bodoni-400) italic text-2xl bg-(--aqua) text-(--neon-yellow) cursor-pointer p-3 hover:bg-(--light-aqua) w-[100%] mt-3 sticky bottom-0 lg:max-xl:text-lg xl:max-2xl:text-xl" type="button" onClick={() => setPlayState("start_menu")}>
            <p>Play Again</p>
            <svg className="w-7 h-7 fill-(--neon-yellow) pointer-events-none lg:max-xl:w-6 lg:max-xl:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M694-466H212v-28h482L460-728l20-20 268 268-268 268-20-20 234-234Z"/></svg>
        </button>
    </section>
  )
}

export default EndMenu;