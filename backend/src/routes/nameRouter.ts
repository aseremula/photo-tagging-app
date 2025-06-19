export {};
const { Router } = require("express");
const nameController = require("../controllers/nameController");
const nameRouter = Router();
const asyncHandler = require("express-async-handler");

// Add asyncHandler to functions to act as a try/catch block when interacting with database
// User
// nameRouter.get("/:levelId", asyncHandler(levelController.levelGet));
// levelRouter.get("/:userId", asyncHandler(levelController.userGet));
nameRouter.post("/", nameController.validateName, asyncHandler(nameController.namePost));

// // Profile
// levelRouter.put("/:userId/profiles/:profileId",  jwtManagement.getJWT, profileController.validateProfile, asyncHandler(profileController.profilePut));
// levelRouter.get("/:userId/profiles", asyncHandler(profileController.profileGet));

module.exports = nameRouter;