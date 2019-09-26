import Filter from "./Filter";
import DataSets from "./DataSets";
import {InsightDataset, InsightError} from "./IInsightFacade";

export default class SComparison extends Filter {
    private field: string;
    private fieldvalue: any;

    constructor(kkey: string, vvalue: any) {
        super(kkey, vvalue);
        this.field = Object.keys(vvalue)[0]; // Will return the main key "IS"
        this.fieldvalue = vvalue[this.field];
    }
    protected applyFilter(ds: DataSets): Promise<any[]> {
        return undefined;
    }

    protected isValid(insDs: InsightDataset[]): Promise<boolean> {
        if (!isNaN(this.fieldvalue)) {
            throw new InsightError("String Comparison using Numeric field");
        }
        // TODO: Implement the rest of these tests
        return undefined;
    }

}
