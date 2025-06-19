require("dotenv").config();
import { Request, Response, NextFunction } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const alphaErr = "can only contain letters.";
const nonoptional_name_lengthErr = "must be between 1 and 70 characters.";
const requiredErr = "is required.";
const outcomes = {
    SUCCESS: "SUCCESS",
    FAILURE: "FAILURE",
};

const validateName = [   
    body("name").trim().escape()
    .not().isEmpty().withMessage({category: "name", description: `Name ${requiredErr}`}).bail()
    .isAlpha("en-US", { ignore: ' ' }).withMessage({category: "name", description: `Name ${alphaErr}`}).bail()
    .isLength({ min: 1, max: 70 }).withMessage({category: "name", description: `Name ${nonoptional_name_lengthErr}`}).bail(),
];

// Check if the name submitted is valid to use in leaderboard
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
                errors: errors.array(),
            },
        };
        
        res.status(200).json(invalidData);
    }
    else
    {
        const validData = {
            outcome: outcomes.SUCCESS,
            title: "Validation Check Success",
            description: "Validation check successful! Name provided is valid.",
            data: {
                isValidName: true,
                name: name,
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