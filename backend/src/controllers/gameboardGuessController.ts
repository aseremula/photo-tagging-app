require("dotenv").config();
import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { body, param, validationResult, Meta } = require("express-validator");
const asyncHandler = require("express-async-handler");

const GUESS_RANGE = 150; // guess must be within this many pixels to count
const guessRangeErr = "must be an integer between 0 and 10000.";
const intRangeErr = "must be an integer between 1 and 5.";
const intErr = "must be an integer.";
const doesNotExistErr = "does not exist.";
const requiredErr = "is required.";
const outcomes = {
    SUCCESS: "SUCCESS",
    FAILURE: "FAILURE",
};

const validateGuess = [
    body("coordinateXGuess").trim().escape()
    .not().isEmpty().withMessage({category: "coordinateX", description: `The X coordinate guess ${requiredErr}`}).bail()
    .isInt({min: 0, max: 10000}).withMessage({category: "coordinateX", description: `The X coordinate guess ${guessRangeErr}`}).bail(),

    body("coordinateYGuess").trim().escape()
    .not().isEmpty().withMessage({category: "coordinateY", description: `The Y coordinate guess ${requiredErr}`}).bail()
    .isInt({min: 0, max: 10000}).withMessage({category: "coordinateY", description: `The Y coordinate guess ${guessRangeErr}`}).bail(),

    param("levelNumber").trim().escape()
    .not().isEmpty().withMessage({category: "levelNumber", description: `The level number ${requiredErr}`}).bail()
    .isInt().withMessage({category: "levelNumber", description: `The level number ${intErr}`}).bail()
    .custom(asyncHandler(async (levelNumber: string) => {
        const level = await prisma.level.findUnique({
            where: {
                levelNumber: parseInt(levelNumber),
            },
        });

        if(!level)
        { 
            throw new Error();
        }
        return true;
    })).withMessage({category: "levelNumber", description: `A level with this number ${doesNotExistErr}`}).bail(),

    body("imageNumber").trim().escape()
    .not().isEmpty().withMessage({category: "imageNumber", description: `The image number ${requiredErr}`}).bail()
    .isInt({min: 1, max: 5}).withMessage({category: "imageNumber", description: `The image number ${intRangeErr}`}).bail()
    .custom(asyncHandler(async (imageNumber: string, meta: typeof Meta ) => {
        const req = meta.req as Request;
        const image = await prisma.answer.findMany({
            where: {
                imageNumber: parseInt(imageNumber),
                level: { 
                    levelNumber: parseInt(req.params.levelNumber),
                },
            },
        });

        if(!image)
        { 
            throw new Error();
        }
        return true;
    })).withMessage({category: "imageNumber", description: `An image with this number ${doesNotExistErr}`}).bail(),
];

// Given a set of guessed coordinates and a particular image, check if the guess matches the image coordinates stored in the database
async function gameboardGuessGet(req: Request, res: Response) {
    const { coordinateXGuess, coordinateYGuess, imageNumber } = req.body;
    const { levelNumber } = req.params;

    const errors = validationResult(req);
    if(!errors.isEmpty()) 
    {
        const invalidData = {
            outcome: outcomes.FAILURE,
            title: "Gameboard Guess GET Failure",
            description: "The guessed coordinates could not be checked because the data given was not valid.",
            data: {
                errors: errors.array(),
            },
        };
        res.status(200).json(invalidData);
    }
    else
    {
        // Get the coordinates of the image selected. Use prisma's findMany as we do not have an id, but have a unique identifier when image and level number are paired together
        const image = await prisma.answer.findMany({
            where: {
                imageNumber: parseInt(imageNumber),
                level: {
                    levelNumber: parseInt(levelNumber),
                },
            },
        });
        
        // Find how many answers this level contains in order to keep track of which images the user has found
        const answerCount = await prisma.answer.count({
            where: {
                level: {
                    levelNumber: parseInt(levelNumber),
                },
            },
        });

        // Convert req.body variables into integers and check if user's guess fits within the given range
        let isGuessCorrect = false;
        let isGameComplete = false;
        let remainingImages: number[] = [];

        const coordinateXGuessNumber = parseInt(coordinateXGuess);
        const coordinateYGuessNumber = parseInt(coordinateYGuess);
        if((coordinateXGuessNumber >= image[0].coordinateX - GUESS_RANGE && coordinateXGuessNumber <= image[0].coordinateX + GUESS_RANGE) && (coordinateYGuessNumber >= image[0].coordinateY - GUESS_RANGE && coordinateYGuessNumber <= image[0].coordinateY + GUESS_RANGE))
        {
            isGuessCorrect = true;

            // If the user has not correctly guessed this image yet, add it to the set
            if(req.session.correctlyGuessedImages)
            {
                // Create a set if this is the first image the user guessed correctly. The set is as large as the number of images in the level
                if(req.session.correctlyGuessedImages.length === 0)
                {
                    req.session.correctlyGuessedImages = new Array(answerCount).fill(false);
                }
                req.session.correctlyGuessedImages[imageNumber-1] = true;

                // Win conditions: if all the level's images were found (marked as correctly guessed), record the time and inform user the game is complete
                if(req.session.correctlyGuessedImages.length === answerCount && !req.session.correctlyGuessedImages.includes(false))
                {
                    isGameComplete = true;
                    req.session.endTime = new Date();
                }

                // Record which images the user still must find to win the game
                req.session.correctlyGuessedImages.forEach((imageNumber, index) => { 
                    if(imageNumber === false) {
                        remainingImages.push(index+1);
                    }
                });
            }
            else
            {
                // If the session data set tracking correctly guessed images fails, send a response informing the game is not working as intended
                // This also catches if the cookie data was removed/edited
                const internalErrorData = {
                    outcome: outcomes.FAILURE,
                    title: "Gameboard Guess GET Failure",
                    description: "The guessed coordinate was checked, but could not be counted due to an internal server error.",
                    data: {
                        imageNumber: imageNumber,
                        isGuessCorrect: isGuessCorrect,
                        isGameComplete: null,
                        remainingImages: null,
                    },
                };
                res.status(200).json(internalErrorData);
                return;
            }
        }

        const validData = {
            outcome: outcomes.SUCCESS,
            title: "Gameboard Guess GET Success",
            description: "Checking the guessed coordinates was successful! Result of guess returned.",
            data: {
                imageNumber: imageNumber,
                isGuessCorrect: isGuessCorrect,
                isGameComplete: isGameComplete,
                remainingImages: (!isGameComplete && remainingImages.length === 0) ? null : remainingImages,
            },
        };
        res.status(200).json(validData);
    }
}

module.exports = 
{
    gameboardGuessGet,
    validateGuess,
};