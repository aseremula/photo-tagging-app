require("dotenv").config();
import { Request, Response, NextFunction } from 'express';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const bcrypt = require("bcryptjs");
// const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const outcomes = {
    SUCCESS: "SUCCESS",
    FAILURE: "FAILURE",
};

// Get a single user given an ID. Omit sensitive data (like password) so both authorized and unauthorized users can fetch this resource
async function levelGet(req: Request, res: Response) {
    const { levelId } = req.params;
    // const user = await prisma.level.findUnique({
    //     omit: {
    //         password: true,
    //     },
    //     where: {
    //         id: levelId,
    //     },
    //     include: {
    //         posts: {
    //             omit: {
    //                 createdAt: true,
    //                 updatedAt: true,
    //                 content: true,
    //                 published: true,
    //                 authorId: true,
    //             },
                
    //         },
    //         profile: true,
    //     },
    // });

    const user = await prisma.level.findUnique({
        where: {
            id: levelId,
        }
    });

    if(user)
    {
        const userData = {
            outcome: outcomes.SUCCESS,
            title: "User Found Successfully",
            description: "User found successfully! User data returned.",
            data: {
                user: user,
            },
        };
        res.status(200).json(userData);
    }
    else
    {
        const userData = {
            outcome: outcomes.FAILURE,
            title: "User Missing",
            description: "A user with the ID provided does not exist.",
            data: {},
        };
        res.status(200).json(userData);
    }
}

module.exports = 
{
    levelGet,
};