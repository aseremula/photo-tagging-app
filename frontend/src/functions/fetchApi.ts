export type AvailableMethods = "GET" | "POST";
export type HostType = "local" | "web";

export async function fetchApi(hostType: HostType, path: string, method: AvailableMethods, body: object | null)
{
    const LOCALHOST_URL = "http://localhost:3003";
    const WEBHOST_URL = "https://efind-8ubk.onrender.com/api"; // frontend link + "/api" as we are rewriting to backend in order to send cookies. Since Render (onrender) is on the Public Suffix List (won't let you set cookies for security purposes), we will point to the backend to simulate the frontend and backend being on the same domain and therefore sharing cookies automatically

    try
    {
        const headers = {
            'Content-Type': 'application/json'
        };

        const completedPath = (hostType === "local" ? LOCALHOST_URL : WEBHOST_URL) + path;

        const response = await fetch(completedPath, {
            mode: 'cors', 
            method: method, 
            headers: headers,
            credentials: 'include', // must add this when using cookies so credentials (cookies) are sent with request to server 
            ...(method === "POST" && {body: JSON.stringify(body)}) // if POST request, attach the body
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