import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import DataSets from "./DataSets";

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
        return Promise.reject("Not implemented.");
    }

    private isValidId(id: string): boolean {
        // Tests whether or not ID provided is valid
        if (this.validID(id)) {
            return true;
        }
        if (this.isAdded(id)) {
            return false;
        }
        return true;
    }

    private validID(id: string): boolean {
        // TODO : GET THE REGEX EQUIVALENT
        return (!(id.includes(" ")) || !(id.includes("_")));
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
        return Promise.reject("Not implemented.");
    }

    public performQuery(query: any): Promise<any[]> {
        return Promise.reject("Not implemented.");
    }

    public listDatasets(): Promise<InsightDataset[]> {
        let insightDatasets: InsightDataset[];
        insightDatasets = [];
        for (let [datasetId, dataSet] of Object.entries(this.dataSets)) {
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
