import Filter from "./Filter";
import DataSets from "./DataSets";
import {InsightDataset, InsightError} from "./IInsightFacade";
import SComparison from "./SComparison";
import MComparison from "./MComparison";
import LogicComparison from "./LogicComparison";

export default class Negation extends Filter {
    private filter: Filter;

    constructor(kkey: string, vvalue: any) {
        super(kkey, vvalue);
        if (vvalue.hasOwnProperty("AND")) {
            this.filter = new LogicComparison ("AND", vvalue.AND);
        } else if (vvalue.hasOwnProperty("OR")) {
            this.filter = new LogicComparison ("OR", vvalue.OR);
        } else if (vvalue.hasOwnProperty("IS")) {
            this.filter = new SComparison ("IS", vvalue.IS);
        } else if (vvalue.hasOwnProperty("LT")) {
            this.filter = new MComparison ("LT", vvalue.LT);
        } else if (vvalue.hasOwnProperty("GT")) {
            this.filter = new MComparison ("GT", vvalue.GT);
        } else if (vvalue.hasOwnProperty("EQ")) {
            this.filter = new MComparison ("EQ", vvalue.EQ);
        } else if (vvalue.hasOwnProperty("NOT")) {
            this.filter = new Negation ("NOT", vvalue.NOT);
        } else {
            throw new InsightError("Invalid Field");
        }
    }
    protected applyFilter(ds: DataSets): Promise<any[]> {
        return undefined;
    }

    protected isValid(insDs: InsightDataset[]): Promise<boolean> {
        // TODO: Implement the rest of these tests
        return undefined;
    }

}
