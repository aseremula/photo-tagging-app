import { createContext } from "react";

// If more than 1 level was present, level info would be obtained via database
export interface LevelContextType {
    levelInfo: {
        img: string,
        title: string,
        numberOfImages: number,
        levelNumber: number,
    }
}

// Create the context with initial/backup values
export const LevelContext = createContext<LevelContextType>({
    levelInfo: { 
        img: "san_francisco", 
        title: "San Francisco",
        numberOfImages: 5, 
        levelNumber: 1 
    }
});