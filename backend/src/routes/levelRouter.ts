export {};
const { Router } = require("express");
const levelController = require("../controllers/levelController");
const levelRouter = Router();
// import asyncHandler from "express-async-handler";
const asyncHandler = require("express-async-handler");

// Add asyncHandler to functions to act as a try/catch block when interacting with database
// User
levelRouter.get("/:levelId", asyncHandler(levelController.levelGet));
// levelRouter.get("/:userId", asyncHandler(levelController.userGet));
// levelRouter.post("/", levelController.validateUser, asyncHandler(levelController.userPost));

// // Profile
// levelRouter.put("/:userId/profiles/:profileId",  jwtManagement.getJWT, profileController.validateProfile, asyncHandler(profileController.profilePut));
// levelRouter.get("/:userId/profiles", asyncHandler(profileController.profileGet));

module.exports = levelRouter;