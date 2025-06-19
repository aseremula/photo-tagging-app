export {};
const { Router } = require("express");
const leaderboardController = require("../controllers/leaderboardController");
const leaderboardRouter = Router();
const asyncHandler = require("express-async-handler");

// Add asyncHandler to functions to act as a try/catch block when interacting with database
// User
// leaderboardRouter.get("/:levelId", asyncHandler(levelController.levelGet));
// levelRouter.get("/:userId", asyncHandler(levelController.userGet));
leaderboardRouter.post("/", leaderboardController.validateScore, asyncHandler(leaderboardController.leaderboardPost));

// // Profile
// levelRouter.put("/:userId/profiles/:profileId",  jwtManagement.getJWT, profileController.validateProfile, asyncHandler(profileController.profilePut));
// levelRouter.get("/:userId/profiles", asyncHandler(profileController.profileGet));

module.exports = leaderboardRouter;