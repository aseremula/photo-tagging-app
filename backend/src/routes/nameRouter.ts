export {}; // prevents variables like asyncHandler from being declared globally
const { Router } = require("express");
const nameController = require("../controllers/nameController");
const nameRouter = Router();
const asyncHandler = require("express-async-handler");

// Add asyncHandler to functions to act as a try/catch block when interacting with database
// Name Validation
nameRouter.post("/", nameController.validateName, asyncHandler(nameController.namePost));

module.exports = nameRouter;