export type AvailableMethods = "GET" | "POST";
export type HostType = "local" | "web";

export async function fetchApi(hostType: HostType, path: string, method: AvailableMethods, body: object | null)
{
    const LOCALHOST_URL = "http://localhost:3003";
    const WEBHOST_URL = "https://efind-qk5v.onrender.com";

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