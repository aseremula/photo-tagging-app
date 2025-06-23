require("dotenv").config();
import { Request, Response } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { body, query, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { differenceInMilliseconds, format } = require("date-fns");

const intRangeErr = "must be an integer between greater than 0 and less than 25.";
const intErr = "must be an integer.";
const doesNotExistErr = "does not exist.";
const requiredErr = "is required.";
const outcomes = {
    SUCCESS: "SUCCESS",
    FAILURE: "FAILURE",
};

const validateScore = [
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
    const { levelNumber } = req.body;
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
        // Grab name from session data. In case the name does not exist, use "Player" instead
        let leaderboardName = "Player";
        if(req.session.name)
        {
            leaderboardName = req.session.name;
        }

        // Get start time from session data. If the start time does not exist, use the max time instead. Otherwise, calculate the difference between the start and end times in milliseconds and format it as minutes:seconds.milliseconds
        const endTime = new Date();
        let leaderboardTime = "59:59.99"; // minutes:seconds.milliseconds
        const MAX_TIME_MILLISECONDS = 3599990; // leaderboardTime variable in milliseconds
    
        if(req.session.startTime)
        {
            const diffMilliseconds = differenceInMilliseconds(endTime, req.session.startTime);
            if(diffMilliseconds < MAX_TIME_MILLISECONDS)
            {
                leaderboardTime = format(diffMilliseconds, "m:ss.SS");
            }
            req.session.startTime = undefined; // prevent a user from submitting multiple scores that may rank in the leaderboard during a single game
        }

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
                name: leaderboardName,
                time: leaderboardTime,
                leaderboardId: level.leaderboard.id,
            },
        });

        // With this new score added to the level's leaderboard, grab either all the players or the top X players (if numberOfScores was provided)
        const leaderboardScores = await prisma.leaderboard.findUnique({
            where: {
                id: level.leaderboard.id,
            },
            include: {
                scores: {
                    orderBy: {
                        time: 'asc', // smallest to largest times
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