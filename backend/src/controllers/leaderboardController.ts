require("dotenv").config();
import { Request, Response, NextFunction } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const bcrypt = require("bcryptjs");
const { body, query, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const alphaErr = "can only contain letters.";
const nonoptional_name_lengthErr = "must be between 1 and 70 characters.";
const intRangeErr = "must be an integer between greater than 0 and less than 25.";
const intErr = "must be an integer.";
const doesNotExistErr = "does not exist.";
const requiredErr = "is required.";
const outcomes = {
    SUCCESS: "SUCCESS",
    FAILURE: "FAILURE",
};

const validateScore = [
    // In case user tampers with name in localStorage
    body("name").trim().escape()
    .not().isEmpty().withMessage({category: "name", description: `Name ${requiredErr}`}).bail()
    .isAlpha("en-US", { ignore: ' ' }).withMessage({category: "name", description: `Name ${alphaErr}`}).bail()
    .isLength({ min: 1, max: 70 }).withMessage({category: "name", description: `Name ${nonoptional_name_lengthErr}`}).bail(),

    // TODO: add validation to check format of time?
    body("time").trim().escape()
    .not().isEmpty().withMessage({category: "time", description: `Time completed ${requiredErr}`}).bail(),

    body("levelNumber").trim().escape()
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
    
    query("numberOfScores").trim().escape()
    .optional({ values: "falsy" })
    .isInt({gt: 0, lt: 25}).withMessage({category: "numberOfScores", description: `The amount of scores requested ${intRangeErr}`}).bail(),
];

// Create and add the player's score to the appropriate leaderboard, then send the updated leaderboard back in response. Entire leaderboard is sent back as default option
async function leaderboardPost(req: Request, res: Response) {
    const { name, time, levelNumber } = req.body;
    const { numberOfScores } = req.query;

    const errors = validationResult(req);
    if(!errors.isEmpty()) 
    {
        const invalidData = {
            outcome: outcomes.FAILURE,
            title: "Leaderboard POST Failure",
            description: "POSTing to the leaderboard failed because the data given was not valid.",
            data: {
                errors: errors.array(),
            },
        };
        
        res.status(200).json(invalidData);
    }
    else
    {
        // Find the level and leaderboard ID in order to POST to correct leaderboard
        const level = await prisma.level.findUnique({
            where: {
                levelNumber: parseInt(levelNumber),
            },
            include: {
                leaderboard: true,
            },
        });

        // Create a score for the player
        const playerScore = await prisma.score.create({
            data: {
                name: name,
                time: time,
                leaderboardId: level.leaderboard.id,
            },
        });

        // With this new score added to the level's leaderboard, grab the top 5 players
        const leaderboardScores = await prisma.leaderboard.findUnique({
            where: {
                id: level.leaderboard.id,
            },
            include: {
                scores: {
                    orderBy: {
                        time: 'asc',
                    },
                    take: ((typeof numberOfScores === "string") ? parseInt(numberOfScores) : prisma.skip),
                },
            },
        });

        const validData = {
            outcome: outcomes.SUCCESS,
            title: "Leaderboard POST Success",
            description: "POSTing to the leaderboard successful! Player score and updated leaderboard returned.",
            data: {
                playerScore: playerScore,
                leaderboardScores: leaderboardScores,
            },
        };

        // Send status 201: Created
        res.status(201).json(validData);
    }
}

module.exports = 
{
    leaderboardPost,
    validateScore,
};