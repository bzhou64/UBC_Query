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
import * as dh from "./DataHelpers";

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
            if (!dh.isIDValid(id)) {
                reject(new InsightError("Invalid Id"));
            }
            this.isAdded(id).then((cond) => {
                if (cond) {
                    reject(new InsightError("Dataset already exists"));
                } else {
                    let zipFile = new JSZip();
                    let currDataset: DataSet = new DataSet(id, kind);
                    if (kind === InsightDatasetKind.Courses) {
                        zipFile.loadAsync(content, {base64: true}).then((data) => {
                            let promisesFiles: any[] = this.createFileReadPromises(data);
                            Promise.all(promisesFiles).then((filesJSON) => {
                                // let totalSec = 0;
                                // let validSec = 0;
                                dh.addSectionsDataset(filesJSON, currDataset);
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
                    } else if (kind === InsightDatasetKind.Rooms) {
                        zipFile.loadAsync(content, {base64: true}).then((data) => {
                            this.readRoomsHTML(data);
                            resolve(["Yo"]);
                                // let promisesFiles: any[] = this.createFileReadPromises(data);
                                // Promise.all(promisesFiles).then((filesJSON) => {
                                //     // let totalSec = 0;
                                //     // let validSec = 0;
                                //     dh.addSectionsDataset(filesJSON, currDataset);
                                //     if (Object.keys(currDataset.records).length) {
                                //         this.addDatasetDisk(currDataset);
                                //         resolve(Object.keys(this.datasets.datasets));
                                //     } else {
                                //         reject(new InsightError("No valid section in Zip File"));
                                //     }
                                // })
                                //     .catch((errAll: any) => {
                                //         reject(new InsightError("Invalid Promises to read zip"));
                                //         // throw new InsightError("Invalid Promises to read zip");
                                //     });
                            }
                        ).catch((errGlo: any) => {
                            reject(new InsightError("Invalid Zip File"));
                        });
                    }
                }
            });
        });
    }

    private async readRoomsHTML(data: any) {
        const parse5 = require("parse5");
        let index = "rooms/index.htm";
        if (data.files.hasOwnProperty(index)) {
            const htmlReadPromise = data.files[index].async("text");
            const htmlData = await htmlReadPromise.catch((err: any) => {
                throw new InsightError(err);
            });
            let htmlDoc = parse5.parse(htmlData);
            let htmlHtml = htmlDoc.childNodes.find((elem: any) => {
                return elem.nodeName === "html";
            });
            let htmlBody = htmlHtml.childNodes.find((elem: any) => {
                return elem.nodeName === "body";
            });
            let tables = this.findTableBody(htmlBody);
            let setLinks: any = new Set();
            tables.forEach((table: any) => {
                this.exploreTable(table, setLinks);
            });
            let promiseBuildings = this.createBuildingReadPromises(data, setLinks);
            await Promise.all(promiseBuildings).then((buildingDataFiles) => {
                buildingDataFiles.forEach((buildingData: any) => {
                    let htmlBuilding: any = parse5.parse(buildingData);
                    Log.trace("yo");
                });
            }).catch((errAll: any) => {
                throw new InsightError(errAll);
            });
        } else {
            throw new InsightError("rooms/index.html not found");
        }
    }

    private createBuildingReadPromises(data: any, setLinks: Set<string>): any[] {
        let promisesFiles: any[] = [];
        setLinks.forEach((buildingPath: string) => {
            let currPath = "rooms" + buildingPath.substr(1);
            if (data.files.hasOwnProperty(currPath)) {
                let currFilePromise = data.files[currPath].async("text");
                promisesFiles.push(currFilePromise);
            }
        });
        return promisesFiles;
    }

    private exploreTable(table: any, setLinks: Set<string>) {
        let tableBody: any = table.childNodes.find((elem: any) => {
            return elem.nodeName === "tbody";
        });
        let arrayLinks: any[] = [];
        dh.findTag(tableBody, arrayLinks, "a");
        arrayLinks.forEach((a: any) => {
            let link = a.attrs.find((attr: any) => {
                return attr.name === "href";
            });
            setLinks.add(link.value);
        });
    }

    private findTableBody(body: any) {
        let arrayTables: any[] = [];
        dh.findTag(body, arrayTables, "table");
        Log.trace("found tables");
        return arrayTables;
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
            if (dh.isIDValid(id)) {
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
