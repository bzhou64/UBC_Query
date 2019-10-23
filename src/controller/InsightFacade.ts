import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    NotFoundError,
    ResultTooLargeError
} from "./IInsightFacade";
import DataSets from "./DataSets";
import * as JSZip from "jszip";
import * as fs from "fs";
import DataSet from "./DataSet";
import Section from "./Section";
import Query from "./Query";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
    private datasets: DataSets;
    private dataDir = "./data/";

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
        this.datasets = new DataSets();
        this.loadDatasetDisk();
    }

    private loadDatasetDisk() {
        let filenames = fs.readdirSync(this.dataDir);
        filenames.forEach((filename) => {
            try {
                let fileContent = fs.readFileSync(this.dataDir + filename, "utf8");
                let currDatasetRead: DataSet = JSON.parse(fileContent);
                this.datasets.addDataset(currDatasetRead);
            } catch (e) {
                throw new InsightError("Cannot read file from disk");
            }
        });
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.loadDatasetDisk();
            if (!this.isIDValid(id)) {
                reject(new InsightError("Invalid Id"));
            }
            this.isAdded(id).then((cond) => {
                if (cond) {
                    reject(new InsightError("Dataset already exists"));
                } else {
                    let currDataset: DataSet = new DataSet(id, InsightDatasetKind.Courses);
                    let zipFile = new JSZip();
                    zipFile.loadAsync(content, {base64: true}).then((data) => {
                            let promisesFiles: any[] = this.createFileReadPromises(data);
                            Promise.all(promisesFiles).then((filesJSON) => {
                                // let totalSec = 0;
                                // let validSec = 0;
                                filesJSON.forEach((fileJSON: any) => {
                                    if (fileJSON != null) {
                                        for (let section of fileJSON["result"]) {
                                            // totalSec++;
                                            let sectionObj: Section = this.createValidSection(section);
                                            // Log.trace(sectionObj);
                                            if (sectionObj) {
                                                // validSec++;
                                                currDataset.addRecord(sectionObj);
                                            }
                                        }
                                    }
                                });
                                // Log.trace(validSec);
                                // Log.trace(totalSec);
                                if (Object.keys(currDataset.records).length) {
                                    this.addDatasetDisk(currDataset);
                                    resolve(Object.keys(this.datasets.datasets));
                                } else {
                                    reject(new InsightError("No valid section in Zip File"));
                                }
                            })
                                .catch((errAll: any) => {
                                    reject(new InsightError("Invalid Promises to read zip"));
                                    // throw new InsightError("Invalid Promises to read zip");
                                });
                        }
                    ).catch((errGlo: any) => {
                        reject(new InsightError("Invalid Zip File"));
                    });
                }
            });
        });
        // TODO: AL - Test whether string is blankspace, field is underscored or ID exists (COMPLETED)
        // return Promise.reject("Not implemented.");
    }

    private createFileReadPromises(data: any): any[] {
        let promisesFiles: any[] = [];
        for (let file in data.files) {
            if (file.length > "courses/".length && file.substring(0, 8) === "courses/") {
                let currFilePromise = data.files[file].async("text")
                    .then((courseData: any) => {
                        try {
                            return JSON.parse(courseData);
                        } catch (e) {
                            return null;
                        }
                    })
                    .catch((errZip: any) => {
                        Log.trace(errZip);
                    });
                promisesFiles.push(currFilePromise);
            }
        }
        return promisesFiles;
    }

    private createValidSection(section: any) {
        if (section.Subject !== undefined && section.Course !== undefined &&
            section.Avg !== undefined && section.Professor !== undefined && section.Title !== undefined
            && section.Pass !== undefined && section.Fail !== undefined && section.Audit !== undefined
            && section.id !== undefined  && section.Year !== undefined) {
            let year = 1900;
            if (section.Year === "overall") {
                year = 1900;
            } else {
                year = parseInt(section.Year, 10);
            }
            let sectionObject: Section = new Section(section.Subject.toString(),
                section.Course.toString(), parseFloat(section.Avg),
                section.Professor.toString(), section.Title.toString(), parseInt(section.Pass, 10),
                parseInt(section.Fail, 10), parseInt(section.Audit, 10), section.id.toString(),
                year);
            return sectionObject;
        }
        return null;
    }

    private addDatasetDisk(currDataset: DataSet) {
        this.datasets.addDataset(currDataset);
        try {
            if (!fs.existsSync(this.dataDir)) {
                fs.mkdirSync(this.dataDir);
            }
            fs.writeFileSync(this.dataDir + currDataset.id,
                JSON.stringify(currDataset));
        } catch (e) {
            throw new InsightError("Cannot write to disk");
        }
    }

    private isIDValid(id: string): boolean {
        return !(id === undefined ||  id === null ||
            id.includes("_") || id === "" || !id.replace(/\s/g, "").length);
    }

    private isAdded(id: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.listDatasets().then((datasets: InsightDataset[]) => {
                datasets.forEach((dset) => {
                    if (dset.id === id) {
                        return resolve(true);
                    }
                });
                return resolve(false);
            }).catch((err: any) => {
                reject(new InsightError("Cannot check if dataset is added"));
            });
        });
    }

    public removeDataset(id: string): Promise<string> {
        // Check if id is valid
        return new Promise<string>((resolve, reject) =>  {
            this.loadDatasetDisk();
            if (this.isIDValid(id)) {
                this.isAdded(id).then((val) => {
                    if (!val) {
                        reject(new NotFoundError("Dataset to remove is not added"));
                    } else {
                        try {
                            delete this.datasets.datasets[id];
                        } catch (e) {
                            reject(new InsightError("Cannot remove dataset from memory"));
                        }
                        try {
                            fs.unlinkSync(this.dataDir + id);
                        } catch (e) {
                            reject(new InsightError("Cannot remove dataset from disk"));
                        }
                        resolve(id);
                    }
                }).catch((err: any) => {
                    reject(new InsightError("Cannot check if dataset is added"));
                });
            } else {
                reject(new InsightError("Invalid ID"));
            }
        });
    }

    public performQuery(query: any): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            // this.loadDatasetDisk();
            try {
                let queryObj: Query = new Query(query, this.datasets);
                if (queryObj.result.length > 5000) {
                    reject(new ResultTooLargeError("More that 5000 results"));
                }
                resolve(queryObj.result);
            } catch (e) {
                reject(e);
            }
        });
    }

    public listDatasets(): Promise<InsightDataset[]> {
        this.loadDatasetDisk();
        let insightDatasets: InsightDataset[];
        insightDatasets = [];
        for (let [datasetId, dataSet] of Object.entries(this.datasets.datasets)) {
            let insightDataset: InsightDataset = {
                id: datasetId,
                kind: InsightDatasetKind.Courses,
                numRows: Object.keys(dataSet.records).length
            };
            insightDatasets.push(insightDataset);
        }
        return new Promise((resolve, reject) => {
            resolve(insightDatasets);
        });

    }
}
