import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import DataSets from "./DataSets";
import * as JSZip from "jszip";
import * as fs from "fs";
import DataSet from "./DataSet";
import Section from "./Section";
import {rejects} from "assert";

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
                    throw new InsightError("Cannot read from data directory");
                }
                filenames.forEach((filename) => {
                    let fileContent = fs.readFileSync(this.dataDir + filename, "utf8");
                    let currDatasetRead: DataSet = JSON.parse(fileContent);
                    this.datasets.addDataset(currDatasetRead);
                });
                if (!this.isIDValid(id)) {
                    throw new InsightError("Invalid Id");
                }
                this.isAdded(id).then((cond) => {
                    Log.trace("in isAdded");
                    if (cond) {
                        reject(new InsightError("Dataset already exists"));
                    } else {
                        let currDataset: DataSet = new DataSet(id);
                        let zipFile = new JSZip();
                        zipFile.loadAsync(content, {base64: true}).then((data) => {
                                let promisesFiles: any[] = [];
                                for (let file in data.files) {
                                    if (file.length > "courses/".length && file.substring(0, 8) === "courses/") {
                                        let currFilePromise = data.files[file].async("text")
                                            .then((courseData: any) => {
                                                return JSON.parse(courseData);
                                            })
                                            .catch((errZip: any) => {
                                                reject(new InsightError("JSZip cannot parse the contents of a file"));
                                            });
                                        promisesFiles.push(currFilePromise);
                                    }
                                }
                                Promise.all(promisesFiles).then((filesJSON) => {
                                    filesJSON.forEach((fileJSON: any) => {
                                        let sections: any[] = fileJSON["result"];
                                        for (let section of sections) {
                                            if (section.Subject && section.Course &&
                                                section.Avg  && section.Professor && section.Title
                                                && section.Pass && section.Fail && section.Audit
                                                && section.id  && section.Year) {
                                                let sectionObject: Section = new Section(section.Subject,
                                                    section.Course, section.Avg,
                                                    section.Professor, section.Title, section.Pass,
                                                    section.Fail, section.Audit, section.id,
                                                    section.Year);
                                                currDataset.addSection(sectionObject);
                                            }
                                        }
                                    });
                                    if (Object.keys(currDataset.sections).length) {
                                        this.datasets.addDataset(currDataset);
                                        resolve(Object.keys(this.datasets.datasets));
                                        if (!fs.existsSync(this.dataDir)) {
                                            fs.mkdirSync(this.dataDir);
                                        }
                                        fs.writeFileSync(this.dataDir + currDataset.id, JSON.stringify(currDataset));
                                    } else {
                                        throw new InsightError("No valid section in Zip File");
                                    }
                                })
                                    .catch((errAll: any) => {
                                        throw new InsightError("Invalid Promises to read zip");
                                    });
                            }
                        ).catch((errGlo: any) => {
                            throw new InsightError("Invalid Zip File");
                        });
                    }
                });
            });
        });
        // TODO: AL - Test whether string is blankspace, field is underscored or ID exists (COMPLETED)
        // return Promise.reject("Not implemented.");
    }

    // private addDatasetHelper(promisesFile: Array<Promise<{}>>): Promise<string[]> {
    //     return new Promise<string[]>((resolve, reject) => {
    //
    //     });
    // }

    private isIDValid(id: string): boolean {
        // TODO : GET THE REGEX EQUIVALENT
        return (!(id.includes(" ")) && !(id.includes("_")));
    }

    private isAdded(id: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.listDatasets().then((datasets: InsightDataset[]) => {
                datasets.forEach((dset) => {
                    if (dset.id === id) {
                        return resolve(true);
                    }
                });
                return resolve(false);
            }).catch((err: any) => {
                throw new InsightError("Cannot check if dataset is added");
            });
        });
    }

    public removeDataset(id: string): Promise<string> {
        // Check if id is valid
        if (this.isIDValid(id)) {
            if (this.isAdded(id)) {
                try {
                    delete this.datasets.datasets[id];
                } catch (e) {
                    throw new InsightError("Cannot remove dataset from memory");
                }
                try {
                    fs.unlinkSync(this.dataDir + id);
                } catch (e) {
                    throw new InsightError("Cannot remove dataset from disk");
                }
                return new Promise((resolve) => {
                    resolve(id);
                });
            } else {
                throw new NotFoundError("Dataset to remove is not added");
            }
        } else {
            throw new InsightError("Invalid ID");
        }
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
