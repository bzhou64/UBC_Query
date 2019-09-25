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
        return Promise.reject("Not implemented.");
    }

    public removeDataset(id: string): Promise<string> {
        return Promise.reject("Not implemented.");
    }

    public performQuery(query: any): Promise <any[]> {
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
