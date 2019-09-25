import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {

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
        return Promise.reject("Not implemented.");
    }

    public performQuery(query: any): Promise <any[]> {
        return Promise.reject("Not implemented.");
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}
