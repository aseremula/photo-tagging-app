import type { Agent } from 'supertest';
import app from "../app";
const session = require('supertest-session');
const async = require('async');

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

describe("Gameboard Routes/Controller", () => {
    describe("GET /gameboards", () => {
        // supertest-session session variables are just wrappers around supertest agents
        let namedSession: Agent = testSession;

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

        it("notifies when a guess is incorrect", done => {
            namedSession
                .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[1].coordinateXGuess}&coordinateYGuess=${testImageGuesses[1].coordinateYGuess}&imageNumber=${testImageGuesses[0].imageNumber}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    expect(res.body.outcome).toMatch(/success/i);

                    expect(res.body.data.imageNumber).toMatch(`${testImageGuesses[0].imageNumber}`); // using image 2's coordinates to guess where image 1 is located should result in an incorrect guess
                    expect(res.body.data.isGuessCorrect).toBe(false);
                })
            .expect(200, done)
        });

        it("notifies when a guess is correct", done => {
            namedSession
                .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[1].coordinateXGuess}&coordinateYGuess=${testImageGuesses[1].coordinateYGuess}&imageNumber=${testImageGuesses[1].imageNumber}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    expect(res.body.outcome).toMatch(/success/i);

                    expect(res.body.data.imageNumber).toMatch(`${testImageGuesses[1].imageNumber}`);
                    expect(res.body.data.isGuessCorrect).toBe(true);

                    expect(res.body.data.isImageFoundList).toBeInstanceOf(Array);
                    expect(res.body.data.isImageFoundList[testImageGuesses[1].imageNumber-1]).toBe(true);
                })
            .expect(200, done)
        });

        it("notifies when game is complete", done => {
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
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(function(res) {
                        expect(res.body.outcome).toMatch(/success/i);

                        expect(res.body.data.imageNumber).toMatch(`${testImageGuesses[4].imageNumber}`);
                        expect(res.body.data.isGuessCorrect).toBe(true);
                        expect(res.body.data.isGameComplete).toBe(true);
    
                        expect(res.body.data.isImageFoundList).toBeInstanceOf(Array);
                        expect(res.body.data.isImageFoundList).not.toContain(false);
                    })
                    .expect(200, callback); 
                },
            ], done);
        });

        describe("returns a validation error when the request", () => {
            it("has query parameters missing", done => {
                namedSession
                    .get(`/gameboards/${testGameboardNumber}/guess`)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(function(res) {
                        expect(res.body.outcome).toMatch(/failure/i);
    
                        expect(res.body.data.errors).toBeInstanceOf(Array);
                        expect(res.body.data.errors.length).toBe(3);
                        
                        expect(res.body.data.errors[0].msg.description).toMatch(/the x coordinate guess is required/i);
                        expect(res.body.data.errors[1].msg.description).toMatch(/the y coordinate guess is required/i);
                        expect(res.body.data.errors[2].msg.description).toMatch(/image number is required/i);
                    })
                .expect(200, done)
            });

            it("has an X or Y coordinate that is not an integer between 0 and 10000", done => {
                async.series([
                    function(callback:Function) {
                        namedSession
                            .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${-2323}&coordinateYGuess=${-3727}&imageNumber=${testImageGuesses[0].imageNumber}`)
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);
            
                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(2);
                                
                                expect(res.body.data.errors[0].msg.description).toMatch(/must be an integer between 0 and 10000/i);
                                expect(res.body.data.errors[1].msg.description).toMatch(/must be an integer between 0 and 10000/i);
                            })
                        .expect(200, callback);
                    },
                    function(callback:Function) {
                        namedSession
                            .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${2349323}&coordinateYGuess=${3493727}&imageNumber=${testImageGuesses[0].imageNumber}`)
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);
            
                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(2);
                                
                                expect(res.body.data.errors[0].msg.description).toMatch(/must be an integer between 0 and 10000/i);
                                expect(res.body.data.errors[1].msg.description).toMatch(/must be an integer between 0 and 10000/i);
                            })
                        .expect(200, callback);
                    },
                    function(callback:Function) {
                        namedSession
                            .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${"notaninteger"}&coordinateYGuess=${"notaninteger"}&imageNumber=${testImageGuesses[0].imageNumber}`)
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);
            
                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(2);
                                
                                expect(res.body.data.errors[0].msg.description).toMatch(/X coordinate guess must be an integer/i);
                                expect(res.body.data.errors[1].msg.description).toMatch(/Y coordinate guess must be an integer/i);
                            })
                        .expect(200, callback);
                    },
                ], done);
            });

            it("has an image number that is not an integer", done => {
                async.series([
                    function(callback:Function) {
                        namedSession
                            .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[1].coordinateXGuess}&coordinateYGuess=${testImageGuesses[1].coordinateYGuess}&imageNumber=${343.67}`)
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);
            
                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/image number must be an integer/i);
                            })
                        .expect(200, callback);
                    },
                    function(callback:Function) {
                        namedSession
                            .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[1].coordinateXGuess}&coordinateYGuess=${testImageGuesses[1].coordinateYGuess}&imageNumber=${"imageNumber"}`)
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);
            
                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/image number must be an integer/i);
                            })
                        .expect(200, callback);
                    },
                    function(callback:Function) {
                        namedSession
                            .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[1].coordinateXGuess}&coordinateYGuess=${testImageGuesses[1].coordinateYGuess}&imageNumber=${"a&*^$"}`)
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);
            
                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/image number must be an integer/i);
                            })
                        .expect(200, callback);
                    },
                ], done);
            });

            it("has an image number out of range", done => {
                namedSession
                    .get(`/gameboards/${testGameboardNumber}/guess?coordinateXGuess=${testImageGuesses[1].coordinateXGuess}&coordinateYGuess=${testImageGuesses[1].coordinateYGuess}&imageNumber=${343}`)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(function(res) {
                        expect(res.body.outcome).toMatch(/failure/i);
    
                        expect(res.body.data.errors).toBeInstanceOf(Array);
                        expect(res.body.data.errors.length).toBe(1);
                        
                        expect(res.body.data.errors[0].msg.description).toMatch(/must be an integer between 1 and 5/i);
                    })
                .expect(200, done)
            });

            it("has a level number that does not exist", done => { 
                async.series([
                    function(callback:Function) {
                        namedSession
                            .get(`/gameboards/${12356}/guess?coordinateXGuess=${testImageGuesses[1].coordinateXGuess}&coordinateYGuess=${testImageGuesses[1].coordinateYGuess}&imageNumber=${testImageGuesses[1].imageNumber}`)
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);
            
                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/level with this number does not exist/i);
                            })
                        .expect(200, callback)
                    },
                    function(callback:Function) {
                        namedSession
                            .get(`/gameboards/`)
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {            
                                expect(res.body.outcome).toMatch(/failure/i);

                                expect(res.body.description).toMatch(/resource you are trying to GET does not exist/i);
                                expect(Object.keys(res.body.data).length).toBe(0); // empty object
                            })
                        .expect(404, callback)
                    }
                ], done);
            });
        });
    });
});