# Photo Tagging App (eFIND) - Backend
This project is a part of [The Odin Project's NodeJS course](https://www.theodinproject.com/lessons/nodejs-where-s-waldo-a-photo-tagging-app#introduction)
> [Live Demo](https://efind-8ubk.onrender.com/)

# About
As mentioned in the [project overview](https://github.com/aseremula/photo-tagging-app), this full-stack project, titled eFIND, is inspired by [_Where's Waldo?_](https://en.wikipedia.org/wiki/Where's_Wally%3F), a popular series of children's puzzle books where various people, places, and objects must be found inside a crowded illustration. By using session data/cookies to temporarily store anonymous user data on the client and a REST API to control gameplay, eFIND's Typescript with NodeJS and Express backend directs gameplay via 3 main endpoints:

- `POST /names`: given a name, this endpoint uses Express middleware to validate if it only contains letters. If the name passes validation, the gameplay timer begins by updating session data to include the user's start time, chosen name, and list of correctly-guessed characters. Otherwise, no session data is created. This information then gets sent as a third-party cookie to the frontend.

- `GET /gameboards/.../guess`: given a gameboard number, character number, and a user's guessed (X,Y) coordinates, this endpoint uses Prisma ORM to check if the user's coordinates are exact or very close to the coordinates stored in a PostgreSQL database for the character selected on a particular gameboard. If the user is correct, their session data/cookie is updated to include the character on the user's list of correctly-guessed characters; this endpoint also records the user's end time once they successfully guess all characters. As this endpoint relies on session data/cookies existing, it is not reachable if the user has not entered a valid name via `POST /names` to start the game.

- `POST /leaderboards`: given a gameboard number and a completed game, this endpoint calculates the user's final score, submits it to the PostgreSQL database, and grabs the leaderboard associated with the gameboard using Prisma ORM. An optional query parameter is used to control how many leaderboard scores to return. As this endpoint relies on session data/cookies existing, it is not reachable if the user has not entered a valid name via `POST /names` to start the game.

Session data/cookies expire when the anonymous user closes eFIND, allowing the backend to prioritize gameboard and leaderboard information. Unit tests following Test-Driven Development (TDD) methods are also provided for the backend using Jest, Supertest, and SuperAgent.

# Built With
- Typescript
- NodeJS
- Express
- Prisma ORM
- PostgreSQL & Neon
- Jest
- Supertest & SuperAgent