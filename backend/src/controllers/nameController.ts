require("dotenv").config();
import { Request, Response } from 'express';
import { getTime } from "date-fns";
const { body, validationResult } = require("express-validator");

const alphaErr = "can only contain letters.";
const nonoptional_name_lengthErr = "must be between 1 and 30 characters.";
const requiredErr = "is required.";
const outcomes = {
    SUCCESS: "SUCCESS",
    FAILURE: "FAILURE",
};

// To be valid, a name must be between 1 and 30 characters and only contain alpha characters. Spaces are also allowed.
const validateName = [   
    body("name").trim().escape()
    .not().isEmpty().withMessage({category: "name", description: `Name ${requiredErr}`}).bail()
    .isAlpha("en-US", { ignore: ' ' }).withMessage({category: "name", description: `Name ${alphaErr}`}).bail()
    .isLength({ min: 1, max: 30 }).withMessage({category: "name", description: `Name ${nonoptional_name_lengthErr}`}).bail(),
];

// Check if the name submitted is valid to use in leaderboard. If it is, start the game by activating the timer
async function namePost(req: Request, res: Response) {
    const { name } = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()) 
    {
        const invalidData = {
            outcome: outcomes.FAILURE,
            title: "Validation Check Failure",
            description: "The validation check failed because the data given was not valid.",
            data: {
                isValidName: false,
                name: name,
                startTime: 0,
                errors: errors.array(),
            },
        };

        // If the user's suggested name fails, use the default "Player" name for session data, cancel starting the timer, and remove the set containing correctly guessed images
        req.session.name = "Player";
        req.session.startTime = undefined;
        req.session.endTime = undefined;
        req.session.correctlyGuessedImages = undefined;
        res.status(200).json(invalidData);
    }
    else
    {
        // If the user's suggested name passes, use it for session data, begin the timer by recording the current time, and declare a set to track the user's correctly guessed images
        req.session.name = name;
        req.session.startTime = new Date();
        req.session.correctlyGuessedImages = [];

        const validData = {
            outcome: outcomes.SUCCESS,
            title: "Validation Check Success",
            description: "Validation check successful! Name provided is valid - timer now activated.",
            data: {
                isValidName: true,
                name: name,
                startTime: getTime(req.session.startTime),
                errors: [],
            },
        };

        // Send status 202: Accepted
        res.status(202).json(validData);
    }
}

module.exports = 
{
    namePost,
    validateName,
};