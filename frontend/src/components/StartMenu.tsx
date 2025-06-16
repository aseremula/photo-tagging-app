import { useState, useContext, type FormEvent } from 'react';
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

function StartMenu() {
    const level = useContext(LevelContext);

    const [formData, setFormData] = useState({
        name: "",
    });

    const [formErrors, setFormErrors] = useState({
        name: {},
    });

    async function handleStartForm(e: FormEvent<NameFormElement>)
    {
        e.preventDefault();
        const outcomes = {
            SUCCESS: "SUCCESS",
            FAILURE: "FAILURE",
        };

        // Remove previous form errors before showing new ones (if any exist)
        const newFormErrors = {
            name: {},
        };
    
        const name = e.currentTarget.elements.name.value;
        const path = ""; // TODO: update path
        const method = "POST";
        const body = { 
            name: name, 
        };

        const response = await getApiResponse(path, method, body);  
        if(response)
        {
            if(response.outcome === outcomes.FAILURE)
            {
                // TODO: make type shaped like error object
                response.data.errors.forEach((error: object) => {
                    if(error.msg.category === "name")
                    {
                        newFormErrors.name = error;
                    }
                });
                setFormData({...formData, name: name});
            }
            else if(response.outcome === outcomes.SUCCESS)
            {
                // Close modal, show image, and start timer
            } 
            setFormErrors(newFormErrors);   
        }  
        else
        {
            throw new Error("Failed to get response from API - internal server error");
        } 
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
    <section className="min-w-115 max-w-115 font-(family-name:--roboto-400) text-(--black) text-xl bg-(--tan) border-1 border-(--aqua) border-dashed pb-3 lg:max-2xl:text-lg">
        <h3 className="font-(family-name:--bodoni-400) italic text-5xl text-(--light-red) p-3 py-6 bg-(--neon-yellow) border-b-(--aqua) border-b-1 border-dashed lg:max-2xl:text-4xl">Instructions</h3>
        <p className="p-3">Can you find these 5 people scattered throughout eBoy's <span className="text-(--aqua) font-bold">{level.title}</span> pixorama? Find and click them fast enough and you may even appear on the leaderboard!</p>

        <form className="flex flex-col gap-1 p-3" id="nameForm" action="" method="POST" onSubmit={handleStartForm}>
            <legend className="font-bold text-lg text-(--gray) lg:max-2xl:text-md">Enter your name to begin:</legend>
            <div className="flex items-center gap-2">
                <div>
                    <label className="aria-invisible" htmlFor="name">Name</label>
                    <input className={`w-[100%] font-(family-name:--roboto-400) text-xl bg-(--off-white) p-3 border-2 rounded-lg ${(Object.keys(formErrors.name).length !== 0) ? "border-(--light-red)" : "border-(--black)"} lg:max-2xl:text-lg`} autoFocus={true} id="name" type="text" name="name" placeholder="John Doe" value={formData.name} onChange={(e) => {
                        setFormData({...formData, name: e.target.value}); 
                    }}/>

                    <div className="flex flex-col items-end">
                        {(Object.keys(formErrors.name).length !== 0) && <p className="text-sm text-(--light-red) font-bold text-right">{formErrors.name.msg.description}</p>}
                    </div>    
                </div>
                
                {/* TODO: clicking button submits form and if name passes, starts gameplay and timer */}
                <button className="flex gap-1 items-center justify-center font-(family-name:--bodoni-400) italic text-2xl bg-(--aqua) text-(--neon-yellow) cursor-pointer p-3 hover:bg-(--light-aqua) lg:max-2xl:text-xl" type="submit">
                    <p>Start</p>
                    <svg className="w-7 h-7 fill-(--neon-yellow) pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M694-466H212v-28h482L460-728l20-20 268 268-268 268-20-20 234-234Z"/></svg>
                </button>
            </div>
        </form>
    </section>
  )
}

export default StartMenu