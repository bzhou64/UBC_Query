import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import DataSets from "./DataSets";
import * as JSZip from "jszip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
    private dataSets: DataSets;

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        // TODO: AL - Test whether string is blankspace, field is underscored or ID exists (COMPLETED)
        if (!(this.isValidId(id))) {
            throw new InsightError();
        }
        // DONE
        // TODO: Al - Figure out how to parse the dataset
        // NOT DONE
        JSZip.loadAsync(content, {base64: true}).then((data) => {
            Log.test(data);
        }).catch( (err: any) => { throw new InsightError("Invalid Zip File"); });
        return Promise.reject("Not implemented.");
    }
    private isValidId(id: string): boolean {
        // Tests whether or not ID provided is valid
        if (id === " ") {
            return false;
        }
        if (id.includes("_")) {
            return false;
        }
        this.listDatasets().then((datasets: InsightDataset[]) => {
            for (const dset of datasets) {
                if (dset.id === id) {
                    return false;
                }
            }
        }).catch((err: any) => {
            return false;
        });

        return true;
    }
    public removeDataset(id: string): Promise<string> {
        // Check if id is valid
        // Check if it is in the list of datasets
        // If it is then remove it
        delete this.dataSets.datasets[id];
        // TODO: delete from disk
        return new Promise((resolve) => {
            resolve(id);
        });
        // return Promise.reject("Not implemented.");
    }

    public performQuery(query: any): Promise <any[]> {
        return Promise.reject("Not implemented.");
    }

    public listDatasets(): Promise<InsightDataset[]> {
        let insightDatasets: InsightDataset[];
        insightDatasets = [];
        for (let [datasetId, dataSet] of Object.entries(this.dataSets.datasets)) {
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
