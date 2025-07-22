import { useState, useContext, type FormEvent } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { LevelContext } from '../context/levelContext';

// From: https://www.epicreact.dev/how-to-type-a-react-form-on-submit-handler
// Tell Typescript directly the types of elements present in the form
interface FormElements extends HTMLFormControlsCollection {
    name: HTMLInputElement
}

// Extend HTMLFormElement and override the elements to have the elements we want it to, preventing unneeded typecasting
interface NameFormElement extends HTMLFormElement {
    readonly elements: FormElements
}

type apiErrorResponse = {
    location: string;
    msg: {
        category: string;
        description: string;
    };
    path: string;
    type: string;
    value: string;
}

interface formErrors {
   [key: string]: apiErrorResponse | null;
};

function StartMenu({ setPlayState, playerName, setPlayerName } : { setPlayState: Dispatch<SetStateAction<playStates>>, playerName: string, setPlayerName: Dispatch<SetStateAction<string>> }) {
    const level = useContext(LevelContext);

    const [formData, setFormData] = useState({
        name: playerName,
    });

    const [formErrors, setFormErrors] = useState<formErrors>({
        name: null,
    });
    const [isLoading, setIsLoading] = useState(false);

    async function handleStartForm(e: FormEvent<NameFormElement>)
    {
        e.preventDefault();
        setIsLoading(true);
        const outcomes = {
            SUCCESS: "SUCCESS",
            FAILURE: "FAILURE",
        };

        // Remove previous form errors before showing new ones (if any exist)
        const newFormErrors: formErrors = {
            name: null,
        };
    
        const name = e.currentTarget.elements.name.value;
        const path = "https://efind-qk5v.onrender.com/names";
        // const path = "http://localhost:3003/names";
        const method = "POST";
        const body = { 
            name: name, 
        };

        const response = await getApiResponse(path, method, body);  
        if(response)
        {
            if(response.outcome === outcomes.FAILURE)
            {
                response.data.errors.forEach((error: apiErrorResponse) => {
                    if(error.msg.category === "name")
                    {
                        newFormErrors.name = error;
                    }
                });
                setFormData({...formData, name: name});
            }
            else if(response.outcome === outcomes.SUCCESS)
            {
                // TODO: Close modal, show image, and start timer
                setPlayState("gameboard_guessing");
                // setPlayState("end_menu");
                setPlayerName(name);
            } 
            setFormErrors(newFormErrors);
        }  
        else
        {
            throw new Error("Failed to get response from API - internal server error");
        } 
        setIsLoading(false); 
    }

    async function getApiResponse(path: string, method: string, body: object) 
    {
        try
        {
            const headers = {
                'Content-Type': 'application/json'
            };

            const response = await fetch(path, {
                mode: 'cors', 
                method: method, 
                headers: headers,
                credentials: 'include', // must add this when using cookies so credentials (cookies) are sent with request to server 
                body: JSON.stringify(body),
            });

            if(!response.ok)
            {
                throw new Error(`Response status: ${response.status}`);
            }
            else
            {
                const APIData = await response.json();
                return APIData;
            }
        }
        catch(error)
        {
            // As anything (unknown) can be thrown, use a type guard to narrow down the type of error before accessing the message property
            if(error instanceof Error) 
            {
                console.error(error.message);
            }
            else
            {
                console.error(error);
            }
        }
    }

  return (
    <section className="min-w-115 max-w-115 font-(family-name:--roboto-400) text-(--black) text-xl bg-(--tan) border-1 border-(--aqua) border-dashed pb-3 lg:max-xl:text-base xl:max-2xl:text-lg">
        <h3 className="font-(family-name:--bodoni-400) italic text-5xl text-(--light-red) p-3 py-6 bg-(--neon-yellow) border-b-(--aqua) border-b-1 border-dashed lg:max-xl:text-3xl lg:max-xl:py-4 xl:max-2xl:text-4xl xl:max-2xl:p-5">Instructions</h3>
        <p className="p-3">Can you find these 5 people scattered throughout eBoy's <span className="text-(--aqua) font-bold">{level.title}</span> pixorama? Find and click them fast enough and you may even appear on the leaderboard!</p>

        <div className="bg-(--aqua) ml-3 mr-3 mt-3 text-base text-(--white) p-3">
            <div className="flex items-center gap-1">
                <svg className="w-6 h-6 fill-(--neon-yellow) pointer-events-none" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"><path d="M450-290h60v-230h-60v230Zm30-298.46q13.73 0 23.02-9.29t9.29-23.02q0-13.73-9.29-23.02-9.29-9.28-23.02-9.28t-23.02 9.28q-9.29 9.29-9.29 23.02t9.29 23.02q9.29 9.29 23.02 9.29Zm.07 488.46q-78.84 0-148.21-29.92t-120.68-81.21q-51.31-51.29-81.25-120.63Q100-401.1 100-479.93q0-78.84 29.92-148.21t81.21-120.68q51.29-51.31 120.63-81.25Q401.1-860 479.93-860q78.84 0 148.21 29.92t120.68 81.21q51.31 51.29 81.25 120.63Q860-558.9 860-480.07q0 78.84-29.92 148.21t-81.21 120.68q-51.29 51.31-120.63 81.25Q558.9-100 480.07-100Zm-.07-60q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                <h4 className="text-xl font-bold font-(family-name:--bodoni-400) italic text-(--neon-yellow) lg:max-xl:text-base xl:max-2xl:text-lg">Notice</h4> 
            </div>
            <p>This site uses its own cookies to track game data. Please allow cookies in order to play!</p>
        </div>

        <form className="flex flex-col gap-1 p-3" id="nameForm" action="" method="POST" onSubmit={handleStartForm}>
            <legend className="font-bold text-lg text-(--gray) lg:max-xl:text-base xl:max-2xl:text-md">Enter your name to begin:</legend>
            
            <div className="flex items-center gap-2">
                <div>
                    <label className="aria-invisible" htmlFor="name">Name</label>
                    <input className={`w-[100%] font-(family-name:--roboto-400) text-xl bg-(--off-white) p-3 border-2 rounded-lg ${(formErrors.name !== null) ? "border-(--light-red)" : "border-(--black)"}  lg:max-xl:text-base xl:max-2xl:text-lg`} autoFocus={true} id="name" type="text" name="name" placeholder="John Doe" value={formData.name} onChange={(e) => {
                        setFormData({...formData, name: e.target.value}); 
                    }}/>
                </div>
                
                {/* TODO: clicking button submits form and if name passes, starts gameplay and timer */}
                {(isLoading) ?
                    <p className="font-bold text-(--gray) loadingScreenText">Loading...</p> 
                    :
                    <button className="flex gap-1 items-center justify-center font-(family-name:--bodoni-400) italic text-2xl bg-(--aqua) text-(--neon-yellow) cursor-pointer p-3 hover:bg-(--light-aqua) lg:max-xl:text-lg xl:max-2xl:text-xl" type="submit">
                        <p>Start</p>
                        <svg className="w-7 h-7 fill-(--neon-yellow) pointer-events-none lg:max-xl:w-6 lg:max-xl:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M694-466H212v-28h482L460-728l20-20 268 268-268 268-20-20 234-234Z"/></svg>
                    </button>
                }
            </div>

            <div className="flex flex-col">
                {(formErrors.name !== null) && <p className="text-sm text-(--light-red) font-bold lg:max-xl:text-xs">{formErrors.name.msg.description}</p>}
            </div>
        </form>
    </section>
  )
}

export default StartMenu;