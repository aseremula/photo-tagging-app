export {};
const { Router } = require("express");
const gameboardGuessController = require("../controllers/gameboardGuessController");
const gameboardRouter = Router();
const asyncHandler = require("express-async-handler");

// Add asyncHandler to functions to act as a try/catch block when interacting with database
// Gameboard
gameboardRouter.get("/:levelNumber/guess", gameboardGuessController.validateGuess, asyncHandler(gameboardGuessController.gameboardGuessGet));

module.exports = gameboardRouter;