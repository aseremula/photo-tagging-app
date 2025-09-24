import request from "supertest";
import app from "../app";

// NOTICE: testing must be done locally in order for unit tests to run. Attempting to test via the web host will not work due to the wrong cookie settings being used (Secure: true) - be sure to set the TESTING variable to "true"!

// To set up unit test environment using Typescript, Jest, and Supertest, follow "Testing with Jest and SuperTest" section of:
// https://ubuverse.com/introduction-typescript-testing/
// Add --runInBand option on command so tests are run on a single thread instead of parallel threads, speeding up tests

describe("App", () => {
    it("sends error message if GET path does not exist", done => {
        request(app)
            .get(`/thispathdoesnotwork`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function(res) {
                expect(res.body.outcome).toMatch(/failure/i);
                expect(res.body.description).toMatch(/resource you are trying to GET does not exist/i);
                expect(Object.keys(res.body.data).length).toBe(0); // empty object
            })
        .expect(404, done)
    });

    it("sends error message if POST path does not exist", done => {
        request(app)
            .post(`/thispathdoesnotwork`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(function(res) {
                expect(res.body.outcome).toMatch(/failure/i);
                expect(res.body.description).toMatch(/resource you are trying to POST does not exist/i);
                expect(Object.keys(res.body.data).length).toBe(0); // empty object
            })
        .expect(404, done)
    });
});