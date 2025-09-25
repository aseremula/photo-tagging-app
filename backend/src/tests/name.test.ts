import request from "supertest";
import app from "../app";
const async = require('async');

// NOTICE: testing must be done locally in order for unit tests to run. Attempting to test via the web host will not work due to the wrong cookie settings being used (Secure: true) - be sure to set the TESTING variable to "true"!

// To write unit tests that require chaining requests:
// https://caolan.github.io/async/v3/docs.html#series
// Use async.series to send GET requests in series/order to correctly guess image coordinates. For example, this allows testing the last image coordinate or leaderboard for game completion

describe("Name Routes/Controller", () => {
    describe("POST /names", () => {
        it("accepts name entry if valid", done => {
            request(app)
                .post('/names')
                .send({name: 'Tommy'})
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {   
                    expect(res.body.outcome).toMatch(/success/i);
                        
                    expect(res.body.data.name).toBe('Tommy');
                    expect(res.body.data.isValidName).toBe(true);
                    expect(res.body.data.startTime).not.toBe(0);

                    expect(res.body.data.errors).toBeInstanceOf(Array);
                    expect(res.body.data.errors.length).toBe(0); 
                })
            .expect(202, done)
        });

        describe("returns a validation error when the request", () => {
            it("is over 30 characters", done => {
                request(app)
                    .post('/names')
                    .send({name: 'Tommy is my name and I will win this game'})
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(function(res) {
                        expect(res.body.outcome).toMatch(/failure/i);
    
                        expect(res.body.data.name).toBe('Tommy is my name and I will win this game');
                        expect(res.body.data.isValidName).toBe(false);
                        expect(res.body.data.startTime).toBe(0);
    
                        expect(res.body.data.errors).toBeInstanceOf(Array);
                        expect(res.body.data.errors.length).toBe(1);
                        expect(res.body.data.errors[0].msg.description).toMatch(/name must be between 1 and 30 characters/i); 
                    })
                .expect(200, done)
            });

            it("contains non-alpha characters", done => {
                request(app)
                    .post('/names')
                    .send({name: 'T0mmy!'})
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(function(res) {
                        expect(res.body.outcome).toMatch(/failure/i);
    
                        expect(res.body.data.name).toBe('T0mmy!');
                        expect(res.body.data.isValidName).toBe(false);
                        expect(res.body.data.startTime).toBe(0);
    
                        expect(res.body.data.errors).toBeInstanceOf(Array);
                        expect(res.body.data.errors.length).toBe(1);
                        expect(res.body.data.errors[0].msg.description).toMatch(/name can only contain letters/i); 
                    })
                .expect(200, done)
            });

            it("is left empty", done => {
                async.series([
                    function(callback:Function) {
                        request(app)
                            .post('/names')
                            .send({name: ''})
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);
            
                                expect(res.body.data.name).toBe('');
                                expect(res.body.data.isValidName).toBe(false);
                                expect(res.body.data.startTime).toBe(0);
            
                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/name is required/i); 
                            })
                        .expect(200, done)
                    },
                    function(callback:Function) {
                        request(app)
                            .post('/names')
                            .send({})
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(function(res) {
                                expect(res.body.outcome).toMatch(/failure/i);
            
                                expect(res.body.data.name).toBe('');
                                expect(res.body.data.isValidName).toBe(false);
                                expect(res.body.data.startTime).toBe(0);
            
                                expect(res.body.data.errors).toBeInstanceOf(Array);
                                expect(res.body.data.errors.length).toBe(1);
                                expect(res.body.data.errors[0].msg.description).toMatch(/name is required/i); 
                            })
                        .expect(200, done)
                    },
                ], done);
            });
        });
    });
});