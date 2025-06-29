import { createContext } from "react";

// If more than 1 level was present, level info would be obtained via database
export interface LevelContextType {
    img: "san_francisco";
    title: "San Francisco";
    numberOfImages: 5;
}

export const LevelContext = createContext<LevelContextType>({ img: "san_francisco", title: "San Francisco", numberOfImages: 5 });