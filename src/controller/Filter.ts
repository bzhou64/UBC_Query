import DataSets from "./DataSets";
import {InsightDataset} from "./IInsightFacade";
import InsightFacade from "./InsightFacade";

export default abstract class Filter {
    /* GENERAL FORMAT
    GT - key
    "course_avg": 80 - field
     */
    protected key: string;
    protected value: any;

    protected constructor(kkey: string, vvalue: any) {
        this.key = kkey;
        this.value = vvalue;
    }
    // TODO: Add a data struct to return values will leave as any[] for now
    /*
    @param: Datasets collection (WILL NEED ANOTHER PARAM)
    @spec: apply the corresponding filter to the list
    @output: A processed JSON array or error thrown - with description
     */
    public abstract applyFilter(ds: DataSets, resultSoFar: any[], insF: InsightFacade): Promise<any[]>;
    /*
    @param: none
    @spec: test validity of fields being used
    @output: throws related error else returns true
     */
    protected abstract isValid(insDs: InsightDataset[]): Promise<boolean>;

}
