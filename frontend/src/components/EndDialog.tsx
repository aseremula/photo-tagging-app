import { useState, useEffect, useRef } from 'react'

function EndDialog({ scoreData } : { scoreData: object }) {
    // TODO: ensure dialog cannot be closed
    const endDialogRef = useRef<HTMLDialogElement>(null);
    // endDialogRef.current?.showModal();
   
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leaderboardInfo, setLeaderboardInfo] = useState({});

    useEffect(() => {
        const outcomes = {
            SUCCESS: "SUCCESS",
            FAILURE: "FAILURE",
        };
    
        async function getLeaderboard() 
        {
            try
            {
                const response = await fetch("", {mode: 'cors'});
                if(!response.ok)
                {
                    throw new Error(`HTTP error: Status ${response.status}`);
                }
                else
                {
                    const APIData = await response.json();
                    if(APIData.outcome === outcomes.FAILURE)
                    {
                        setLeaderboardInfo({});
                    }
                    else if(APIData.outcome === outcomes.SUCCESS)
                    {
                        setLeaderboardInfo(APIData.data);
                    }
                    setError(null);
                }
            }
            catch(error)
            {
                setError(error.message);
            }
            finally
            {
                setIsLoading(false);
            }
        }
        setIsLoading(true);
        getLeaderboard(); 
    }, []);

  return (
    <dialog ref={endDialogRef} className="min-w-115 max-w-115 font-(family-name:--roboto-400) text-(--black) text-xl bg-(--tan) border-1 border-(--aqua) border-dashed lg:max-2xl:text-lg">
        <h3 className="font-(family-name:--bodoni-400) italic text-5xl text-(--light-red) p-3 py-6 bg-(--neon-yellow) border-b-(--aqua) border-b-1 border-dashed lg:max-2xl:text-4xl">Results</h3>
       
       {(isLoading) ? 
        <div className="p-3 text-center">
            <p className="font-bold text-(--gray) loadingScreenText">Grabbing leaderboard...</p>
        </div> 
       :
        ((error || Object.keys(leaderboardInfo).length == 0) ?
            <div className="p-3 text-center">
                <p className="text-3xl lg:max-2xl:text-2xl">⚠️ ✋ 🤔</p>
                <p>There was an error grabbing the leaderboard.</p>
            </div>
        :
            <div className="p-3">
                <table className="table-auto border-collapse w-[100%]">
                        <caption className="text-left font-bold text-(--gray)">Leaderboard</caption>
                        <thead className="">
                            <tr>
                                <th scope="col" className="text-(--aqua) italic text-xs text-center px-3 pt-3">Position</th>
                                <th scope="col" className="text-(--aqua) italic text-xs text-left px-3 pt-3">User</th>
                                <th scope="col" className="text-(--aqua) italic text-xs text-left px-3 pt-3">Time</th>
                            </tr>
                        </thead>
                        <tbody className="border-1 border-(--black)">
                            {/* TODO: enter correct data */}
                            {leaderboardInfo.map((user) => (
                            <tr className="odd:bg-white even:bg-(--off-white)">
                                <th scope="row" className="p-3">#1</th>
                                <td className="p-3 font-(family-name:--bodoni-400) italic">Rosa Ruiz</td>
                                <td className="p-3 text-right">00:02:34</td>
                            </tr>))}
                        </tbody>
                </table>
            </div>)
        }

        {/* TODO: enter scoreData info here */}
        {/* TODO: if scoreData's id matches a leaderboard cell's id, color text */}
        <div className="p-3">
            <table className="table-auto border-collapse border-1 border-(--black) w-[100%]">
                    <caption className="text-left font-bold text-(--gray) mb-1">Your Score</caption>

                    <thead className="aria-invisible">
                        <tr>
                            <th scope="col">Position</th>
                            <th scope="col">User</th>
                            <th scope="col">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="odd:bg-white even:bg-(--off-white)">
                            <th scope="row" className="p-3">#25</th>
                            <td className="p-3 font-(family-name:--bodoni-400) italic text">Rosa Ruiz</td>
                            <td className="p-3 text-right">00:02:34</td>
                        </tr>
                    </tbody>
            </table>
        </div>

        {/* TODO: send user back to StartDialog upon clicking */}
        <button className="flex gap-1 items-center justify-center font-(family-name:--bodoni-400) italic text-2xl bg-(--aqua) text-(--neon-yellow) cursor-pointer p-3 hover:bg-(--light-aqua) w-[100%] lg:max-2xl:text-xl" type="submit">
            <p>Play Again</p>
            <svg className="w-7 h-7 fill-(--neon-yellow) pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M694-466H212v-28h482L460-728l20-20 268 268-268 268-20-20 234-234Z"/></svg>
        </button>
    </dialog>
  )
}

export default EndDialog