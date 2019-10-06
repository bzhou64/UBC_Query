import Filter from "./Filter";
import DataSets from "./DataSets";
import {InsightDataset, InsightError} from "./IInsightFacade";
import SComparison from "./SComparison";
import MComparison from "./MComparison";
import LogicComparison from "./LogicComparison";
import InsightFacade from "./InsightFacade";
import DataSet from "./DataSet";

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
    public applyFilter(ds: DataSet, resultSoFar: any[]): Promise<any[]> {
        try {
            this.isValid().then((result) => {
                    if (result) {
                        // this might not work since I'm comparing objects in an array rather than primitive type
                        // but it's referencing the same object so it should work. Will have to test it out
                        this.filter.applyFilter(ds, resultSoFar).then((arr) => {
                            resultSoFar = resultSoFar.filter((val) => !arr.includes(val));
                            });
                        }
                    });
            return new Promise<any[]>((resolve) => {
                resolve (resultSoFar);
            });
            } catch (e) {
            throw new InsightError(e);
        }
    }
    // couldn't think of a case where negation would be invalid. The only case is where the filter given is wrong
    // but the constructor checks that already
    protected isValid(): Promise<boolean> {
        if (this.key !== "NOT") {
            throw new InsightError("NOT is invalid");
        } else {
            return new Promise<boolean>((resolve) => {
                resolve (true);
            });
        }
    }

}
