import { expect } from "chai";
import * as fs from "fs-extra";
import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string;  // This is injected when reading the file
}

describe("InsightFacade load dataset from disk", function () {
    let insightFacade1: InsightFacade;
    let insightFacade2: InsightFacade;
    let content: any;
    let addPromise: any;
    const cacheDir = __dirname + "/../data";
    beforeEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs before each test, which should make each test independent from the previous one
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
        } catch (err) {
            Log.error(err);
        }
    });
    it("Reject duplicate addition for disk", function () {
        insightFacade1 = new InsightFacade();
        content = fs.readFileSync("./test/data/courses.zip").toString("base64");
        addPromise = insightFacade1.addDataset("courses", content, InsightDatasetKind.Courses).
        then((result: string[]) => {
            insightFacade2 = new InsightFacade();
            const id: string = "courses";
            const expected: string[] = [id];
            return insightFacade2.addDataset("courses", content, InsightDatasetKind.Courses).
            then((result1: string[]) => {
                // expect(result).to.deep.equal(expected);
                expect.fail(result1, expected, "Should be rejected");
            }).catch((err: any) => {
                expect(err).to.be.instanceOf(InsightError);
            });
        });
        });
});

describe("InsightFacade Add/Remove Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        illegal_id: "./test/data/illegal_id.zip",
        noCoursesDir: "./test/data/noCoursesDir.zip",
        incorrectCoursesDir: "./test/data/incorrectCoursesDir.zip",
        noCourseSections: "./test/data/noCourseSections.zip",
        garbageInCourses: "./test/data/garbageInCourses.zip",
        validWithGarbage: "./test/data/validWithGarbage.zip",
        corrupt: "./test/data/corrupt.zip",
        rooms: "./test/data/rooms.zip",

    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
        }
    });

    beforeEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs before each test, which should make each test independent from the previous one
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });
    // Unit Tests for removeDataset
    // This is a unit test. You should create more like this!
    it("Should add a valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
            return insightFacade.listDatasets().then((returnedData: InsightDataset[]) => {
                expect(returnedData).to.have.length(1);
            }).catch((err: any) => {
                expect.fail(err, expected, "Should not have rejected");
            });
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
    it("Should add a valid rooms dataset", function () {
        const id: string = "rooms";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
            return insightFacade.listDatasets().then((returnedData: InsightDataset[]) => {
                expect(returnedData).to.have.length(1);
            }).catch((err: any) => {
                expect.fail(err, expected, "Should not have rejected");
            });
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
    it("Should add a valid dataset with garbage", function () {
        const id: string = "validWithGarbage";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
            return insightFacade.listDatasets().then((returnedData: InsightDataset[]) => {
                expect(returnedData).to.have.length(1);
            }).catch((err: any) => {
                expect.fail(err, expected, "Should not have rejected");
            });
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });

    });
    // reject with undefined id (also undefined dataset)
    it("Reject adding dataset with undefined id", function () {
        const id: string = undefined;
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should be rejected");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    // reject with corrupted zip file
    it("Reject adding dataset with corrupted zip file", function () {
        const id: string = "corrupt";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should be rejected");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    // reject with illegal id (whitespace)
    it("Reject adding dataset with id containing only whitespace", function () {
        const id: string = " ";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should be rejected");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    // reject with illegal id (containing underscore)
    it("Reject adding dataset with underscore in id", function () {
        const id: string = "illegal_id";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should be rejected");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    // reject with duplicate dataset
    it("Reject duplicate addition", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            // expect(result).to.deep.equal(expected);
            return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
                .then((resultDeep: string[]) => {
                    expect.fail(result, expected, "Should be rejected");
                }).catch((err: any) => {
                    expect(err).to.be.instanceOf(InsightError);
                });
        });
    });
    // reject non-existent dataset
    it("Reject adding non-existent dataset", function () {
        const id: string = "nonexistent";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should be rejected");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    // reject dataset with no courses directory
    it("Reject dataset with no courses directory", function () {
        const id: string = "noCoursesDir";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should be rejected");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    // reject dataset with incorrect courses directory
    it("Reject dataset with incorrect courses directory", function () {
        const id: string = "incorrectCoursesDir";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should be rejected");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    // reject dataset with > 1 courses but no sections
    it("Reject dataset with > 1 courses but no sections", function () {
        const id: string = "noCourseSections";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should be rejected");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    // reject dataset with garbage in courses folder
    it("Reject dataset with garbage in courses folder", function () {
        const id: string = "garbageInCourses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail(result, expected, "Should be rejected");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    // Unit Tests for removeDataset
    // Should pass on removal of a valid dataset
    it("Should pass on removal of a valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            // expect(result).to.deep.equal(expected);
            return insightFacade.removeDataset(id)
                .then((resultDeep: string) => {
                    expect(resultDeep).to.deep.equal(id);
                }).catch((err: any) => {
                    expect.fail(err, expected, "Should not have rejected");
                });
        });
    });
    it("Should pass with empty list on removal of a valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            // expect(result).to.deep.equal(expected);
            return insightFacade.removeDataset(id)
                .then((resultDeep: string) => {
                    insightFacade.listDatasets().then((val: InsightDataset[]) => {
                        expect(val.length).to.equal(0);
                    }).catch((reason: any) => {
                        expect.fail(reason, expected, "Should not have rejected listing");
                    });
                    expect(resultDeep).to.deep.equal(id);
                }).catch((err: any) => {
                    expect.fail(err, expected, "Should not have rejected removing");
                });
        });
    });
    // reject with undefined id (also undefined dataset)
    it("Reject removing dataset with undefined id", function () {
        const id: string = undefined;
        const expected: string[] = [id];
        return insightFacade.removeDataset(id).then((result: string) => {
            expect.fail(result, expected, "Should be rejected");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    // reject with illegal id (whitespace)
    it("Reject removing dataset with id containing only whitespace", function () {
        const id: string = " ";
        const expected: string[] = [id];
        return insightFacade.removeDataset(id).then((result: string) => {
            expect.fail(result, expected, "Should be rejected");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    // reject with illegal id (containing underscore)
    it("Reject removing dataset with underscore in id", function () {
        const id: string = "illegal_id";
        const expected: string[] = [id];
        return insightFacade.removeDataset(id).then((result: string) => {
            expect.fail(result, expected, "Should be rejected");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    // reject with removal of non-existent dataset with no dataset added
    it("Reject removing a dataset from empty datasets", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return insightFacade.removeDataset(id).then((result: string) => {
            expect.fail(result, expected, "Should be rejected");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(NotFoundError);
        });
    });
    // reject removing a dataset not been added yet but some data added
    it("Reject removing a dataset not been added yet", function () {
        const idAdd: string = "courses";
        const idRemove: string = "nonexistent";
        const expected: string[] = [idAdd];
        return insightFacade.addDataset(idAdd, datasets[idAdd], InsightDatasetKind.Courses).then((result: string[]) => {
            // expect(result).to.deep.equal(expected);
            return insightFacade.removeDataset(idRemove)
                .then((resultDeep: string) => {
                    expect.fail(resultDeep, expected, "Should be rejected");
                }).catch((err: any) => {
                    expect(err).to.be.instanceOf(NotFoundError);
                });
        });
    });
});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: any } = {
        courses: {id: "courses", path: "./test/data/courses.zip", kind: InsightDatasetKind.Courses},
    };
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);
        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        insightFacade = new InsightFacade();
        for (const key of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[key];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(insightFacade.addDataset(ds.id, data, ds.kind));
        }
        return Promise.all(loadDatasetPromises).catch((err) => {
            /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
             * for the purposes of seeing all your tests run.
             * For D1, remove this catch block (but keep the Promise.all)
             */
            return Promise.resolve("HACK TO LET QUERIES RUN");
        });
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function (done) {
                    insightFacade.performQuery(test.query).then((result) => {
                        TestUtil.checkQueryResult(test, result, done);
                    }).catch((err) => {
                        TestUtil.checkQueryResult(test, err, done);
                    });
                });
            }
        });
    });
});
