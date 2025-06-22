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

        // Convert req.body variables into integers and check if guess fits within the given range
        let isGuessCorrect = false;
        const coordinateXGuessNumber = parseInt(coordinateXGuess);
        const coordinateYGuessNumber = parseInt(coordinateYGuess);
        if((coordinateXGuessNumber >= image[0].coordinateX - GUESS_RANGE && coordinateXGuessNumber <= image[0].coordinateX + GUESS_RANGE) && (coordinateYGuessNumber >= image[0].coordinateY - GUESS_RANGE && coordinateYGuessNumber <= image[0].coordinateY + GUESS_RANGE))
        {
            isGuessCorrect = true;
        }

        const validData = {
            outcome: outcomes.SUCCESS,
            title: "Gameboard Guess GET Success",
            description: "Checking the guessed coordinates was successful! Result of guess returned.",
            data: {
                isGuessCorrect: isGuessCorrect,
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