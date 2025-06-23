export {};
const { Router } = require("express");
const leaderboardController = require("../controllers/leaderboardController");
const leaderboardRouter = Router();
const asyncHandler = require("express-async-handler");

// Add asyncHandler to functions to act as a try/catch block when interacting with database
// Leaderboard
leaderboardRouter.post("/", leaderboardController.validateScore, asyncHandler(leaderboardController.leaderboardPost));

module.exports = leaderboardRouter;