import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import {expect} from "chai";
import Log from "../src/Util";
import * as fs from "fs";
import {InsightError} from "../src/controller/IInsightFacade";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        server.start().catch((err: any) => {
            Log.error("Could not start the server due to " + err);
        });
        // TODO: start server here once and handle errors properly
    });

    after(function () {
        server.stop();
        try {
            fs.unlinkSync("./data/courses");
            fs.unlinkSync("./data/rooms");
            fs.unlinkSync("./data/validWithGarbageCourses");
            fs.unlinkSync("./data/roomsValidGarbage");
        } catch (e) {
            Log.error("Means I forgot to add courses and rooms datasets first. Ignore if this error shows up.");
        }
        // TODO: stop server here once!
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(facade.listDatasets());
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(facade.listDatasets());
    });

    // TODO: read your courses and rooms datasets here once!

    it("PUT test for courses dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(fs.readFileSync("./test/data/courses.zip"))
                .set("Content-Type", "application/x-zip-compressed")
                .then((res: Response) => {
                    Log.test("status is: " + res.status);
                    expect(res.status).to.be.equal(200);
                    Log.test(res);
                }).catch((err: any) => {
                    Log.test("error is: " + err);
                    expect.fail();
                });
        } catch (err) {
            Log.test(err);
        }
    });

    it("PUT test for rooms dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .send(fs.readFileSync("./test/data/rooms.zip"))
                .set("Content-Type", "application/x-zip-compressed")
                .then((res: Response) => {
                    Log.test("status is: " + res.status);
                    expect(res.status).to.be.equal(200);
                }).catch((err: any) => {
                    Log.test("error is: " + err);
                    expect.fail();
                });
        } catch (err) {
            Log.test(err);
        }
    });

    it("PUT test for corrupt.zip dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/corrupt/courses")
                .send(fs.readFileSync("./test/data/corrupt.zip"))
                .set("Content-Type", "application/x-zip-compressed")
                .then((res: Response) => {
                    Log.test("status is: " + res.status);
                    expect.fail("Should not have added dataset");
                }).catch((err: any) => {
                    Log.test("error is: " + err);
                    expect(err);
                });
        } catch (err) {
            Log.test(err);
        }
    });

    it("PUT test for garbageInCourses.zip dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/garbageInCourses/courses")
                .send(fs.readFileSync("./test/data/garbageInCourses.zip"))
                .set("Content-Type", "application/x-zip-compressed")
                .then((res: Response) => {
                    Log.test("status is: " + res.status);
                    expect.fail("Should not have added dataset");
                }).catch((err: any) => {
                    Log.test("error is: " + err);
                    expect(err);
                });
        } catch (err) {
            Log.test("Does this matter" + err);
        }
    });

    it("PUT test for illegal_id.zip dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/illegal_id/courses")
                .send(fs.readFileSync("./test/data/illegal_id.zip"))
                .set("Content-Type", "application/x-zip-compressed")
                .then((res: Response) => {
                    Log.test("status is: " + res.status);
                    expect.fail("Should not have added dataset");
                }).catch((err: any) => {
                    Log.test("error is: " + err);
                    expect(err);
                });
        } catch (err) {
            Log.test("Does this matter" + err);
        }
    });

    it("PUT test for incorrectCoursesDir.zip dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/incorrectCoursesDir/courses")
                .send(fs.readFileSync("./test/data/incorrectCoursesDir.zip"))
                .set("Content-Type", "application/x-zip-compressed")
                .then((res: Response) => {
                    Log.test("status is: " + res.status);
                    expect.fail("Should not have added dataset");
                }).catch((err: any) => {
                    Log.test("error is: " + err);
                    expect(err);
                });
        } catch (err) {
            Log.test("Does this matter" + err);
        }
    });

    it("PUT test for noCoursesDir.zip dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/noCoursesDir/courses")
                .send(fs.readFileSync("./test/data/noCoursesDir.zip"))
                .set("Content-Type", "application/x-zip-compressed")
                .then((res: Response) => {
                    Log.test("status is: " + res.status);
                    expect.fail("Should not have added dataset");
                }).catch((err: any) => {
                    Log.test("error is: " + err);
                    expect(err);
                });
        } catch (err) {
            Log.test("Does this matter" + err);
        }
    });

    it("PUT test for noCourseSections.zip dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/noCourseSections/courses")
                .send(fs.readFileSync("./test/data/noCourseSections.zip"))
                .set("Content-Type", "application/x-zip-compressed")
                .then((res: Response) => {
                    Log.test("status is: " + res.status);
                    expect.fail("Should not have added dataset");
                }).catch((err: any) => {
                    Log.test("error is: " + err);
                    expect(err);
                });
        } catch (err) {
            Log.test("Does this matter" + err);
        }
    });

    it("PUT test for roomsMissIndex.zip dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/roomsMissIndex/rooms")
                .send(fs.readFileSync("./test/data/roomsMissIndex.zip"))
                .set("Content-Type", "application/x-zip-compressed")
                .then((res: Response) => {
                    Log.test("status is: " + res.status);
                    expect.fail("Should not have added dataset");
                }).catch((err: any) => {
                    Log.test("error is: " + err);
                    expect(err);
                });
        } catch (err) {
            Log.test("Does this matter" + err);
        }
    });

    it("PUT test for roomsNoRoom.zip dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/roomsNoRoom/rooms")
                .send(fs.readFileSync("./test/data/roomsNoRoom.zip"))
                .set("Content-Type", "application/x-zip-compressed")
                .then((res: Response) => {
                    Log.test("status is: " + res.status);
                    expect.fail("Should not have added dataset");
                }).catch((err: any) => {
                    Log.test("error is: " + err);
                    expect(err);
                });
        } catch (err) {
            Log.test("Does this matter" + err);
        }
    });

    it("PUT test for roomsValidGarbage.zip dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/roomsValidGarbage/rooms")
                .send(fs.readFileSync("./test/data/roomsValidGarbage.zip"))
                .set("Content-Type", "application/x-zip-compressed")
                .then((res: Response) => {
                    Log.test("status is: " + res.status);
                    expect(res.status).to.be.equal(200);
                }).catch((err: any) => {
                    Log.test("error is: " + err);
                    expect.fail("Should not have given an error");
                });
        } catch (err) {
            Log.test("Does this matter" + err);
        }
    });

    it("PUT test for validWithGarbageCourses.zip dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/validWithGarbageCourses/courses")
                .send(fs.readFileSync("./test/data/validWithGarbage.zip"))
                .set("Content-Type", "application/x-zip-compressed")
                .then((res: Response) => {
                    Log.test("status is: " + res.status);
                    expect(res.status).to.be.equal(200);
                }).catch((err: any) => {
                    Log.test("error is: " + err);
                    expect.fail("Should not have given an error");
                });
        } catch (err) {
            Log.test("Does this matter" + err);
        }
    });
    // Sample on how to format PUT requests
    /*
    it("PUT test for courses dataset", function () {
        try {
            return chai.request(SERVER_URL)
                .put(ENDPOINT_URL)
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(204);
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });
    */

    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
