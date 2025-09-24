require("dotenv").config();
import { Request, Response, NextFunction } from 'express';
const express = require("express");
const session = require("cookie-session");
const app = express();
const cors = require('cors');

const nameRouter = require("./routes/nameRouter");
const leaderboardRouter = require("./routes/leaderboardRouter");
const gameboardRouter = require("./routes/gameboardRouter");

app.use(express.json());
app.set("trust proxy", 1); // trust X-Forwarded- headers on Render so request is seen as secure (needed for sharing cookies between front and backend)
app.use(session({ 
  secret: process.env.SECRET, 
  resave: false, 
  saveUninitialized: false,
  proxy: true,
  name: "eFIND", // cookie name
  sameSite: process.env.HOST === "web" ? 'none' : 'strict', // allow explicit cross-site cookies as the front and back-end are on different sites
  secure: process.env.HOST === "web" && process.env.TESTING === "false", // require cookies to be served over HTTPS and not HTTP - must be true when sameSite is 'none'
  httpOnly: process.env.HOST === "web", // stop client-side JavaScript access to cookie, which prevents cross-site scripting (XSS) attacks
  partitioned: process.env.HOST === "web", // for Google CHIPS update, "...cookies from embedded sites will be partitioned and only readable from the same top level site from which it was created"
})); // use sessions to store user-specific data like name and leaderboard time
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["https://efind-8ubk.onrender.com", "http://localhost:5173"], // only accept requests from local & web frontends
    methods: ["POST", "GET", "PUT", "OPTIONS", "HEAD"],
    credentials: true, // Enable cookies and credentials
    optionsSuccessStatus: 200, // For legacy browser support
  })
); // enable CORS so API can be accessed from different origins (such as different IPs and URLs)

app.use("/names", nameRouter);
app.use("/leaderboards", leaderboardRouter);
app.use("/gameboards", gameboardRouter);

// Declare the session data properties:
// This interface allows the declaring of additional properties on the session object using [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
declare module 'express-session' {
  interface SessionData {
    name: string;
    startTime: Date;
    endTime: Date;
    correctlyGuessedImages: boolean[]; // since using a Set in session data causes it to be serialized/deserialized into an array/object, mimic a set by using an array of boolean values
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

export default app;