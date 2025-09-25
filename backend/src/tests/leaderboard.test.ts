require("dotenv").config();
import type { Agent } from 'supertest';
import app from "../app";
const session = require('supertest-session');
const async = require('async');

import loadTestLevels from "./helperFunctions/loadTestLevels";

// NOTICE: testing must be done locally in order for unit tests to run. Attempting to test via the web host will not work due to the wrong cookie settings being used (Secure: true) - be sure to set the TESTING variable to "true"!

// To write unit tests that require chaining requests:
// https://caolan.github.io/async/v3/docs.html#series
// Use async.series to send GET requests in series/order to correctly guess image coordinates. For example, this allows testing the last image coordinate or leaderboard for game completion

// To manage session data and the passing of cookies:
// https://www.npmjs.com/package/supertest-session
const testSession = session(app);

const testGameboardNumber = 1;
const testImageGuesses = [
    {
        imageNumber: 1,
        coordinateXGuess: 2491,
        coordinateYGuess: 6144,
    },
    {
        imageNumber: 2,
        coordinateXGuess: 6419,
        coordinateYGuess: 2852,
    },
    {
        imageNumber: 3,
        coordinateXGuess: 3430,
        coordinateYGuess: 2831,
    },
    {
        imageNumber: 4,
        coordinateXGuess: 7116,
        coordinateYGuess: 8565,
    },
    {
        imageNumber: 5,
        coordinateXGuess: 495,
        coordinateYGuess: 9541,
    },
];

describe("Leaderboard Routes/Controller", () => {
    describe("POST /leaderboards", () => {
        const numberOfScores = 3;
        const levelNumber = 1;

        // supertest-session session variables are just wrappers around supertest agents
        let namedSession: Agent = testSession;
        
        // Must be using appropriate env variables to test backend & reset database
        beforeEach(async () => {
            if(process.env.TESTING === "false") {
                throw new Error("Testing not fully enabled - please switch to testing mode.");
            }
            else if(process.env.DATABASE_URL?.includes("test") === false) {
                throw new Error("Testing not fully enabled - please switch to testing database.");
            }
            else {
               // Reset database to clear leaderboard stats
                await loadTestLevels(); 
            }
        });

        // In order to test this path, a valid name must have been entered so the game is in play
        beforeEach((done) => {
            testSession
                .post('/names')
                .send({name: 'Tommy'})
                .expect(202)
                .end(function (err:Error) {
                    if (err) return done(err);
                    namedSession = testSession;
                    return done();
                });
        });

        it("does not add score to leaderboard if game unfinished", done => {
            namedSession
                .post(`/leaderboards?numberOfScores=${numberOfScores}`)
                .send({ levelNumber: levelNumber })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    expect(res.body.outcome).toMatch(/failure/i);
                    expect(res.body.description).toMatch(/game is not complete/i);
                    expect(Object.keys(res.body.data).length).toBe(0);
                })
            .expect(200, done)
        });

        it("returns score and leaderboard of set size if game finished and number of scores specified", done => {
            // Run a series of requests: first, make GET requests to guess all image coordinates correctly and finish the game. Then, make a POST request to submit score to leaderboard and return results
            async.series([
                function(callback:Function) { 
                    namedSession
                    .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[0].coordinateXGuess}&coordinateYGuess=${testImageGuesses[0].coordinateYGuess}&imageNumber=${testImageGuesses[0].imageNumber}`)
                    .expect(200, callback); 
                },
                function(callback:Function) { 
                    namedSession
                    .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[1].coordinateXGuess}&coordinateYGuess=${testImageGuesses[1].coordinateYGuess}&imageNumber=${testImageGuesses[1].imageNumber}`)
                    .expect(200, callback); 
                },
                function(callback:Function) { 
                    namedSession
                    .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[2].coordinateXGuess}&coordinateYGuess=${testImageGuesses[2].coordinateYGuess}&imageNumber=${testImageGuesses[2].imageNumber}`)
                    .expect(200, callback); 
                },
                function(callback:Function) { 
                    namedSession
                    .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[3].coordinateXGuess}&coordinateYGuess=${testImageGuesses[3].coordinateYGuess}&imageNumber=${testImageGuesses[3].imageNumber}`)
                    .expect(200, callback); 
                },
                function(callback:Function) { 
                    namedSession
                    .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[4].coordinateXGuess}&coordinateYGuess=${testImageGuesses[4].coordinateYGuess}&imageNumber=${testImageGuesses[4].imageNumber}`)
                    .expect(200, callback); 
                },
                function(callback:Function) { 
                    namedSession
                        .post(`/leaderboards?numberOfScores=${numberOfScores}`)
                        .send({ levelNumber: levelNumber })
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(function(res) {
                            expect(res.body.outcome).toMatch(/success/i);

                            expect(res.body.data.playerScore.name).toBe("Tommy");
                            expect(res.body.data.playerScore.time).toBeDefined();

                            expect(res.body.data.leaderboardScores.scores).toBeInstanceOf(Array);
                            expect(res.body.data.leaderboardScores.scores.length).toBe(3); // 3 scores requested

                            expect(res.body.data.leaderboardScores.scores[0].name).toBe("Orange");
                            expect(res.body.data.leaderboardScores.scores[0].time).toBe(1);

                            expect(res.body.data.leaderboardScores.scores[1].name).toBe("Green");
                            expect(res.body.data.leaderboardScores.scores[1].time).toBe(2);

                            expect(res.body.data.leaderboardScores.scores[2].name).toBe("Yellow")
                            expect(res.body.data.leaderboardScores.scores[2].time).toBe(3);

                            expect(res.body.data.isPlayerOnLeaderboard).toBe(false);
                            expect(res.body.data.playerRank).toBe(6);
                        })
                    .expect(201, callback); 
                },
            ], done);
        });

        it("returns score and leaderboard of all scores if game finished and number of scores not specified", done => {
            // Run a series of requests: first, make GET requests to guess all image coordinates correctly and finish the game. Then, make a POST request to submit score to leaderboard and return results
            async.series([
                function(callback:Function) { 
                    namedSession
                    .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[0].coordinateXGuess}&coordinateYGuess=${testImageGuesses[0].coordinateYGuess}&imageNumber=${testImageGuesses[0].imageNumber}`)
                    .expect(200, callback); 
                },
                function(callback:Function) { 
                    namedSession
                    .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[1].coordinateXGuess}&coordinateYGuess=${testImageGuesses[1].coordinateYGuess}&imageNumber=${testImageGuesses[1].imageNumber}`)
                    .expect(200, callback); 
                },
                function(callback:Function) { 
                    namedSession
                    .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[2].coordinateXGuess}&coordinateYGuess=${testImageGuesses[2].coordinateYGuess}&imageNumber=${testImageGuesses[2].imageNumber}`)
                    .expect(200, callback); 
                },
                function(callback:Function) { 
                    namedSession
                    .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[3].coordinateXGuess}&coordinateYGuess=${testImageGuesses[3].coordinateYGuess}&imageNumber=${testImageGuesses[3].imageNumber}`)
                    .expect(200, callback); 
                },
                function(callback:Function) { 
                    namedSession
                    .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[4].coordinateXGuess}&coordinateYGuess=${testImageGuesses[4].coordinateYGuess}&imageNumber=${testImageGuesses[4].imageNumber}`)
                    .expect(200, callback); 
                },
                function(callback:Function) { 
                    namedSession
                        .post(`/leaderboards`)
                        .send({ levelNumber: levelNumber })
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(function(res) {
                            expect(res.body.outcome).toMatch(/success/i);

                            expect(res.body.data.playerScore.name).toBe("Tommy");
                            expect(res.body.data.playerScore.time).toBeDefined();

                            expect(res.body.data.leaderboardScores.scores).toBeInstanceOf(Array);
                            expect(res.body.data.leaderboardScores.scores.length).toBe(6); // all 5 scores in leaderboard + 1 score from user just submitted

                            expect(res.body.data.leaderboardScores.scores[0].name).toBe("Orange");
                            expect(res.body.data.leaderboardScores.scores[0].time).toBe(1);

                            expect(res.body.data.leaderboardScores.scores[1].name).toBe("Green");
                            expect(res.body.data.leaderboardScores.scores[1].time).toBe(2);

                            expect(res.body.data.leaderboardScores.scores[2].name).toBe("Yellow")
                            expect(res.body.data.leaderboardScores.scores[2].time).toBe(3);

                            expect(res.body.data.leaderboardScores.scores[3].name).toBe("Purple")
                            expect(res.body.data.leaderboardScores.scores[3].time).toBe(4);

                            expect(res.body.data.leaderboardScores.scores[4].name).toBe("Blue")
                            expect(res.body.data.leaderboardScores.scores[4].time).toBe(5);

                            expect(res.body.data.isPlayerOnLeaderboard).toBe(false);
                            expect(res.body.data.playerRank).toBe(6);
                        })
                    .expect(201, callback); 
                },
            ], done);
        });
    
        describe("returns a validation error when the request", () => {
            beforeEach((done) => {
                // Run a series of GET requests to guess all image coordinates correctly and finish the game
                async.series([
                    function(callback:Function) { 
                        namedSession
                        .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[0].coordinateXGuess}&coordinateYGuess=${testImageGuesses[0].coordinateYGuess}&imageNumber=${testImageGuesses[0].imageNumber}`)
                        .expect(200, callback); 
                    },
                    function(callback:Function) { 
                        namedSession
                        .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[1].coordinateXGuess}&coordinateYGuess=${testImageGuesses[1].coordinateYGuess}&imageNumber=${testImageGuesses[1].imageNumber}`)
                        .expect(200, callback); 
                    },
                    function(callback:Function) { 
                        namedSession
                        .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[2].coordinateXGuess}&coordinateYGuess=${testImageGuesses[2].coordinateYGuess}&imageNumber=${testImageGuesses[2].imageNumber}`)
                        .expect(200, callback); 
                    },
                    function(callback:Function) { 
                        namedSession
                        .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[3].coordinateXGuess}&coordinateYGuess=${testImageGuesses[3].coordinateYGuess}&imageNumber=${testImageGuesses[3].imageNumber}`)
                        .expect(200, callback); 
                    },
                    function(callback:Function) { 
                        namedSession
                        .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[4].coordinateXGuess}&coordinateYGuess=${testImageGuesses[4].coordinateYGuess}&imageNumber=${testImageGuesses[4].imageNumber}`)
                        .expect(200, callback); 
                    },
                ], done);
            });

            it("has a level number that does not exist", done => { 
                namedSession
                    .post(`/leaderboards?numberOfScores=${numberOfScores}`)
                    .send({})
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(function(res) {
                        expect(res.body.outcome).toMatch(/failure/i);

                        expect(res.body.data.errors).toBeInstanceOf(Array);
                        expect(res.body.data.errors.length).toBe(1);
                        expect(res.body.data.errors[0].msg.description).toMatch(/level number is required/i); 
                    })
                .expect(200, done); 
            });

            it("has a level number that is not an integer", done => {
                async.series([
                    function(callback:Function) { 
                        namedSession
                            .post(`/leaderboards?numberOfScores=${numberOfScores}`)
                            .send({ levelNumber: "levelNumber4" })
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);

                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/level number must be an integer/i); 
                            })
                        .expect(200, callback); 
                    },
                    function(callback:Function) { 
                        namedSession
                            .post(`/leaderboards?numberOfScores=${numberOfScores}`)
                            .send({ levelNumber: 573.34 })
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);

                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/level number must be an integer/i); 
                            })
                        .expect(200, callback); 
                    },
                    function(callback:Function) { 
                        namedSession
                            .post(`/leaderboards?numberOfScores=${numberOfScores}`)
                            .send({ levelNumber: "&*#*" })
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);

                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/level number must be an integer/i); 
                            })
                        .expect(200, callback); 
                    },
                ], done);
            });

            it("has the number of scores requested as an integer that is 0 or less", done => {
                async.series([
                    function(callback:Function) { 
                        namedSession
                            .post(`/leaderboards?numberOfScores=${-20}`)
                            .send({ levelNumber: levelNumber })
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);

                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/amount of scores requested must be an integer greater than 0/i); 
                            })
                        .expect(200, callback); 
                    },
                    function(callback:Function) { 
                        namedSession
                            .post(`/leaderboards?numberOfScores=${0}`)
                            .send({ levelNumber: levelNumber })
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);

                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/amount of scores requested must be an integer greater than 0/i); 
                            })
                        .expect(200, callback); 
                    },
                ], done);
            });

            it("has the number of scores requested as a non-integer", done => {
                async.series([
                    function(callback:Function) { 
                        namedSession
                            .post(`/leaderboards?numberOfScores=${"numberofscores"}`)
                            .send({ levelNumber: levelNumber })
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);

                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/amount of scores requested must be an integer greater than 0/i); 
                            })
                        .expect(200, callback); 
                    },
                    function(callback:Function) { 
                        namedSession
                            .post(`/leaderboards?numberOfScores=${"scores=456"}`)
                            .send({ levelNumber: levelNumber })
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);

                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/amount of scores requested must be an integer greater than 0/i); 
                            })
                        .expect(200, callback); 
                    },
                    function(callback:Function) { 
                        namedSession
                            .post(`/leaderboards?numberOfScores=${23.454}`)
                            .send({ levelNumber: levelNumber })
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);

                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/amount of scores requested must be an integer greater than 0/i); 
                            })
                        .expect(200, callback); 
                    },
                ], done);
            });
        });
    });
});