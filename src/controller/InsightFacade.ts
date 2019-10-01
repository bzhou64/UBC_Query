import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import DataSets from "./DataSets";
import * as JSZip from "jszip";
import * as fs from "fs";
import DataSet from "./DataSet";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
    private datasets: DataSets;

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        let dataDir = "data/";
        if (!this.datasets) {
            this.datasets = new DataSets();
            fs.readdir(dataDir, (err, filenames) => {
                if (err) {
                    throw new InsightError("Cannot read from data directory");
                }
                filenames.forEach((filename) => {
                    fs.readFile(dataDir + filename, "utf8", (errFile, fileContent) => {
                        if (errFile) {
                            throw new InsightError("Cannot read: " + filename);
                        }
                        let currDataset: DataSet = JSON.parse(fileContent);
                        this.datasets.addDataset(currDataset);
                    });
                });
            });
        }
        // TODO: AL - Test whether string is blankspace, field is underscored or ID exists (COMPLETED)
        if (!this.isIDValid(id)) {
            throw new InsightError("Invalid Id");
        }

        return new Promise<string[]>((resolve, reject) => {
            if (this.isAdded(id)) {
                reject(new InsightError("It's already exists"));
            }
            // DONE
            // TODO: Al - Figure out how to parse the dataset
            // NOT DONE
            let zipFile = new JSZip();
            zipFile.loadAsync(content, {base64: true}).then((data) => {
                let promisesFiles = Array<Promise<{}>>();
                for (let file in data.files) {
                    if (file.length > "courses/".length && file.substring(0, 8) === "courses/") {
                        let currFilePromise = data.files[file].async("text")
                            .then((courseData: any) => {
                                return JSON.parse(courseData);
                            })
                            .catch((err: any) => {
                                reject(new InsightError("JSZip cannot parse the contents of a file"));
                            });
                        promisesFiles.push(currFilePromise);
                    }
                }
                Promise.all(promisesFiles).then((filesJSON) => {
                    filesJSON.forEach((fileJSON) => {
                        Log.trace(fileJSON);
                    });
                });

            }
            ).catch((err: any) => {
                throw new InsightError("Invalid Zip File");
            });

        });

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

    private isAdded(id: string): boolean {
        this.listDatasets().then((datasets: InsightDataset[]) => {
            for (const dset of datasets) {
                if (dset.id === id) {
                    return true;
                }
            }
        }).catch((err: any) => {
            return true;
        });
        return false;
    }

    public removeDataset(id: string): Promise<string> {
        // Check if id is valid
        // Check if it is in the list of datasets
        // If it is then remove it
        delete this.datasets.datasets[id];
        // TODO: delete from disk
        return new Promise((resolve) => {
            resolve(id);
        });
        // return Promise.reject("Not implemented.");
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
                numRows: Object.keys(dataSet).length
            };
            insightDatasets.push(insightDataset);
        }
        return new Promise((resolve, reject) => {
            resolve(insightDatasets);
        });

    }
}
