import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import {expect} from "chai";
import Log from "../src/Util";
import * as fs from "fs-extra";
import {InsightDatasetKind, InsightError} from "../src/controller/IInsightFacade";
import TestUtil from "./TestUtil";
import {ITestQuery} from "./InsightFacade.spec";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;
    const cacheDir = __dirname + "/../data";
    // dataset of datasets to test PUT for
    const datasetsToTest: { [id: string]: any } = {
        courses: {id: "courses", kind: InsightDatasetKind.Courses, valid: true},
        rooms: {id: "rooms", kind: InsightDatasetKind.Rooms, valid: true},
        /*corrupt: {id: "corrupt", kind: InsightDatasetKind.Courses, valid: false},
        garbageInCourses: {id: "garbageInCourses", kind: InsightDatasetKind.Courses, valid: false},
        illegalID: {id: "illegal_id", kind: InsightDatasetKind.Courses, valid: false},
        incorrectCoursesDir: {id: "incorrectCoursesDir", kind: InsightDatasetKind.Courses, valid: false},
        noCoursesDir: {id: "noCoursesDir", kind: InsightDatasetKind.Courses, valid: false},
        noCoursesSections: {id: "noCoursesSections", kind: InsightDatasetKind.Courses, valid: false},
        roomsMissIndex: {id: "roomsMissIndex", kind: InsightDatasetKind.Rooms, valid: false},
        roomsNoRoom: {id: "roomsNoRoom", kind: InsightDatasetKind.Rooms, valid: false},
        roomsValidGarbage: {id: "roomsValidGarbage", kind: InsightDatasetKind.Rooms, valid: true},
        validWithGarbage: {id: "validWithGarbage", kind: InsightDatasetKind.Courses, valid: true},*/
        validCourseButWrongTypeTest: {id: "validCourseButWrongTypeTest", kind: "random", valid: false}
    };

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        server.start().catch((err: any) => {
            Log.error("Could not start the server due to " + err);
        });
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
        } catch (err) {
            Log.error(err);
        }
    });

    after(function () {
        server.stop();
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(server.insf.listDatasets());
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(server.insf.listDatasets());
    });

    describe("PUT test for each dataset", function () {
        for (let key of Object.keys(datasetsToTest)) {
            it(datasetsToTest[key].id + "dataset PUT test", function () {
                try {
                    let ds: any = datasetsToTest[key];
                    if (ds.valid) {
                        return chai.request("http://localhost:4321")
                            .put("/dataset/" + ds.id + "/" + ds.kind)
                            .send(fs.readFileSync("./test/data/" + ds.id + ".zip"))
                            .set("Content-Type", "application/x-zip-compressed")
                            .then((res: Response) => {
                                Log.test("status is: " + res.status);
                                Log.test("Response body is: " + res.body.result);
                                expect(res.status).to.be.equal(200);
                            }).catch((err: any) => {
                                Log.test("error is: " + err);
                                expect.fail("Should not have failed");
                            });
                    } else {
                        return chai.request("http://localhost:4321")
                            .put("/dataset/" + ds.id + "/" + ds.kind)
                            .send(fs.readFileSync("./test/data/" + ds.id + ".zip"))
                            .set("Content-Type", "application/x-zip-compressed")
                            .then((res: Response) => {
                                Log.test("status is: " + res.status);
                                expect.fail("Should not have added dataset");
                            }).catch((err: any) => {
                                Log.test("error is: " + err["response"]["error"].text);
                                expect(err);
                            });
                    }
                } catch (err) {
                        Log.test(err);
                    }
            });
        }
    });
});

describe("DELETE test for datasets", function () {
    let facade: InsightFacade = null;
    let server: Server = null;
    // array of ids to test DELETE for
    const datasetsToRemove: { [id: string]: any} = {
        courses: {id: "courses", valid: true, kind: InsightDatasetKind.Courses},
        rooms: {id: "rooms", valid: true, kind: InsightDatasetKind.Rooms},
        undefined: {id: undefined, valid: false, kind: InsightDatasetKind.Courses},
        invalid_id: {id: "invalid_id", valid: false, kind: InsightDatasetKind.Courses},
        invalidWhitespace: {id: "   ", valid: false, kind: InsightDatasetKind.Courses},
        validButNonExistent: {id: "validButNonExistent", valid: false, kind: InsightDatasetKind.Courses}
    };
    const datasetsToRemoveValid: { [id: string]: any} = {
        courses: {id: "courses", kind: InsightDatasetKind.Courses},
        rooms: {id: "rooms", kind: InsightDatasetKind.Rooms}
    };

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        server.start().catch((err: any) => {
            Log.error("Could not start the server due to " + err);
        });
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        for (const key of Object.keys(datasetsToRemoveValid)) {
            const ds = datasetsToRemoveValid[key];
            const data = fs.readFileSync("./test/data/" + ds.id + ".zip").toString("base64");
            loadDatasetPromises.push(server.insf.addDataset(ds.id, data, ds.kind));
        }
        return Promise.all(loadDatasetPromises).catch((err) => {
            return Promise.resolve("HACK TO LET QUERIES RUN");
        });
    });

    after(function () {
        server.stop();
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(server.insf.listDatasets());
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(server.insf.listDatasets());
    });

    describe("DELETE test for datasets", function () {
        for (let key of Object.keys(datasetsToRemove)) {
            it(key + " DELETE dataset test", function () {
                try {
                    let ds: any = datasetsToRemove[key];
                    if (ds.valid) {
                            return chai.request("http://localhost:4321")
                                .del("/dataset/" + ds.id)
                                .then((res: Response) => {
                                    Log.test("status is: " + res.status);
                                    Log.test("result is: " + res.body.result);
                                    expect(res.status).to.be.equal(200);
                                }).catch((err: any) => {
                                    Log.test("error is: " + err);
                                    expect.fail();
                                });
                    } else {
                        return chai.request("http://localhost:4321")
                            .del("/dataset/" + ds.id)
                            .then((res: Response) => {
                                Log.test("status is: " + res.status);
                                expect.fail();
                            }).catch((err: any) => {
                                Log.test("error is: " + err);
                                expect(err);
                            });
                    }
                } catch (e) {
                    Log.test(e);
                }
            });
        }
    });
});

describe("POST query test", function () {
    let facade: InsightFacade = null;
    let server: Server;
    const cacheDir = __dirname + "/../data";
    const datasetsToQuery: { [id: string]: any } = {
        courses: {id: "courses", kind: InsightDatasetKind.Courses},
        rooms: {id: "rooms", kind: InsightDatasetKind.Rooms}
    };
    let testQueries: ITestQuery[] = [];

    chai.use(chaiHttp);

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        server.start().catch((err: any) => {
            Log.error("Could not start the server due to " + err);
        });
        Log.test(`Before: ${this.test.parent.title}`);
        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }
        // load datasets to the server
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        for (const key of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[key];
            if (ds.valid) {
                const data = fs.readFileSync("./test/data/" + ds.id + ".zip").toString("base64");
                loadDatasetPromises.push(server.insf.addDataset(ds.id, data, ds.kind));
            }
        }
        return Promise.all(loadDatasetPromises).catch((err) => {
            return Promise.resolve("HACK TO LET POST RUN");
        });
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        Log.test("server currently has: " + server.insf.listDatasets());
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
        server.stop();
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
        } catch (err) {
            Log.error(err);
        }
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
        Log.test("server currently has: " + server.insf.listDatasets());
    });


    it("Should run POST and return queries if valid", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function () {
                    if (test.isQueryValid) {
                        return chai.request("localhost:4321")
                            .post("/query")
                            .send(test.query)
                            .set("content-type", "application/json")
                            .then((res: Response) => {
                                expect(res.status).to.be.equal(200);
                            }).catch((err) => {
                                expect.fail("Should not have failed");
                            });
                    } else {
                        return chai.request("localhost:4321")
                            .post("/query")
                            .send(test.query)
                            .set("content-type", "application/json")
                            .then((res: Response) => {
                                expect.fail("Should not have failed");
                            }).catch((err) => {
                                expect(err);
                            });
                    }
                });
            }
        });
    });
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
