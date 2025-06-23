require("dotenv").config();
import { Request, Response, NextFunction } from 'express';
const express = require("express");
const session = require("express-session");
const app = express();
const cors = require('cors');
// TODO: block access from any origin except frontend website
// See: https://expressjs.com/en/resources/middleware/cors.html#enabling-cors-pre-flight

const nameRouter = require("./routes/nameRouter");
const leaderboardRouter = require("./routes/leaderboardRouter");
const gameboardRouter = require("./routes/gameboardRouter");

app.use(express.json());
app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: false })); // use sessions to store user-specific data like name and leaderboard time
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // enable CORS so API can be accessed from different origins (such as different IPs and URLs)

app.use("/names", nameRouter);
app.use("/leaderboards", leaderboardRouter);
app.use("/gameboards", gameboardRouter);

// Declare the session data properties:
// This interface allows the declaring of additional properties on the session object using [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
declare module 'express-session' {
    interface SessionData {
      name: string;
      startTime: Date;
    }
}

app.get(/(.*)/, (req: Request, res: Response) => res.status(404).send({
    outcome: "FAILURE",
    title: "Invalid GET Request",
    description: "The resource you are trying to GET does not exist.",
    data: {},
}));

app.post(/(.*)/, (req: Request, res: Response) => res.status(404).send({
    outcome: "FAILURE",
    title: "Invalid POST Request",
    description: "The resource you are trying to POST does not exist.",
    data: {},
}));

// Every thrown error in the application or the previous middleware function calling `next` with an error as an argument will eventually go to this middleware function
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(err.statusCode || 500).send({
      title: "Internal Server Error",
      description: "An error has occurred while processing your request.",
      data: {
        errors: err.message,
      },
    });
});
  
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`);
});