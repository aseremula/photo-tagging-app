import { describe, it, expect } from "vitest";
import { render, screen } from '@testing-library/react';
import ImageIcon from "../components/ImageIcon";

// Set up component's props
const imagePath: string = '/san_francisco/1.jpg'; // for current testing purposes, img path does not matter
const imageNumber: number = 1;

describe('ImageIcon component', () => {
    it('informs user when person has been found', () => {
    
        render(
            <ImageIcon imagePath={imagePath} imageNumber={imageNumber} markAsFound={true}/>
        );

        expect(screen.getByRole('img', { name: /found/i})).toBeVisible();
    });

    it('informs user when person has not yet been found', () => {
    
        render(
            <ImageIcon imagePath={imagePath} imageNumber={imageNumber} markAsFound={false}/>
        );

        expect(screen.getByRole('img', { name: /not yet found/i})).toBeVisible();
    });
});