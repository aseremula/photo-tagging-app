import { describe, it, expect } from "vitest";
import { render, screen } from '@testing-library/react';
import Navigation from "../components/Navigation";
import { LevelContext } from '../context/levelContext';

// Set up component's props & mock the LevelContext
const imageSet: boolean[] = [];
const mockLevelContext = {
    levelInfo: { 
        img: "san_francisco", 
        title: "San Francisco",
        numberOfImages: 3, 
        levelNumber: 1 
    }
};

describe('Navigation bar', () => {
    it('displays game name and title of current pixorama', () => {
    
        render(
            <LevelContext.Provider value={mockLevelContext}>
                <Navigation imageSet={imageSet}/>
            </LevelContext.Provider>
        );

        expect(screen.getByRole('heading', { name: /eFIND/i})).toBeVisible();
        expect(screen.getByRole('heading', { name: mockLevelContext.levelInfo.title})).toBeVisible();
    });

    it('renders children when children prop is passed to component', () => {

        render(
            <LevelContext.Provider value={mockLevelContext}>
                <Navigation imageSet={imageSet} children={<p>00:00.00</p>}/> 
            </LevelContext.Provider>
        );

        expect(screen.getByText(`00:00.00`)).toBeVisible();
    });

    it('displays different images of people to find in gameboard', () => {
        
        render(
            <LevelContext.Provider value={mockLevelContext}>
                <Navigation imageSet={imageSet}/>
            </LevelContext.Provider>
        );

        expect(screen.getAllByRole('img', { name: /person/i}).length).toBe(mockLevelContext.levelInfo.numberOfImages);
        expect(screen.getAllByRole('img', { name: /person/i})[0]).toHaveAttribute('src', `/${mockLevelContext.levelInfo.img}/1.jpg`);
        expect(screen.getAllByRole('img', { name: /person/i})[1]).toHaveAttribute('src', `/${mockLevelContext.levelInfo.img}/2.jpg`);
        expect(screen.getAllByRole('img', { name: /person/i})[2]).toHaveAttribute('src', `/${mockLevelContext.levelInfo.img}/3.jpg`);
    });
});