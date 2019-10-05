import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import DataSets from "./DataSets";
import * as JSZip from "jszip";
import * as fs from "fs";
import DataSet from "./DataSet";
import Section from "./Section";

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
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            fs.readdir(this.dataDir, (err, filenames) => {
                if (err) {
                    reject(new InsightError("Cannot read from data directory"));
                }
                filenames.forEach((filename) => {
                    this.loadDatasetDisk(filename);
                });
                if (!this.isIDValid(id)) {
                    reject(new InsightError("Invalid Id"));
                }
                this.isAdded(id).then((cond) => {
                    if (cond) {
                        reject(new InsightError("Dataset already exists"));
                    } else {
                        let currDataset: DataSet = new DataSet(id);
                        let zipFile = new JSZip();
                        zipFile.loadAsync(content, {base64: true}).then((data) => {
                                let promisesFiles: any[] = this.createFileReadPromises(data);
                                Promise.all(promisesFiles).then((filesJSON) => {
                                    let totalSec = 0;
                                    let validSec = 0;
                                    filesJSON.forEach((fileJSON: any) => {
                                        if (fileJSON != null) {
                                            let sections: any[] = fileJSON["result"];
                                            for (let section of sections) {
                                                totalSec++;
                                                let sectionObj: Section = this.createValidSection(section);
                                                // Log.trace(sectionObj);
                                                if (sectionObj) {
                                                    validSec++;
                                                    currDataset.addSection(sectionObj);
                                                }
                                            }
                                        }
                                    });
                                    Log.trace(validSec);
                                    Log.trace(totalSec);
                                    if (Object.keys(currDataset.sections).length) {
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
        if (section.Subject != null && section.Course != null &&
            section.Avg != null && section.Professor != null && section.Title
            && section.Pass != null && section.Fail != null && section.Audit != null
            && section.id != null  && section.Year != null) {
            let year = 1900;
            if (section.Year === "overall") {
                year = 1900;
            } else {
                year = parseInt(section.Year, 10);
            }
            let sectionObject: Section = new Section(section.Subject.toString(),
                section.Course.toString(), parseInt(section.Avg, 10),
                section.Professor.toString(), section.Title.toString(), parseInt(section.Pass, 10),
                parseInt(section.Fail, 10), parseInt(section.Audit, 10), section.id.toString(),
                year);
            return sectionObject;
        }
        return null;
    }

    private loadDatasetDisk(filename: string) {
        let fileContent = fs.readFileSync(this.dataDir + filename, "utf8");
        let currDatasetRead: DataSet = JSON.parse(fileContent);
        this.datasets.addDataset(currDatasetRead);
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
        return !(id.includes("_") || id === "" || !id.replace(/\s/g, "").length);
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
        return Promise.reject("Not implemented.");
    }

    public listDatasets(): Promise<InsightDataset[]> {
        let insightDatasets: InsightDataset[];
        insightDatasets = [];
        for (let [datasetId, dataSet] of Object.entries(this.datasets.datasets)) {
            let insightDataset: InsightDataset = {
                id: datasetId,
                kind: InsightDatasetKind.Courses,
                numRows: Object.keys(dataSet.sections).length
            };
            insightDatasets.push(insightDataset);
        }
        return new Promise((resolve, reject) => {
            resolve(insightDatasets);
        });

    }
}
