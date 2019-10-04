import Filter from "./Filter";
import DataSets from "./DataSets";
import {InsightDataset, InsightError} from "./IInsightFacade";
import MComparison from "./MComparison";
import SComparison from "./SComparison";
import Negation from "./Negation";

export default class LogicComparison extends Filter {

    private listoffilters: Filter[];
    /*
    @precondition : Will be passed an AND or OR object
     */
    constructor(kkey: string, vvalue: any) {
        super(kkey, vvalue);
        // for (let i = 0; i < vvalue.length; i++) {
        //     if (vvalue[i].hasOwnProperty("AND")) {
        //         this.listoffilters.push(new LogicComparison ("AND", vvalue[i].AND));
        //     } else if (vvalue[i].hasOwnProperty("OR")) {
        //         this.listoffilters.push(new LogicComparison ("OR", vvalue[i].OR));
        //     } else if (vvalue[i].hasOwnProperty("IS")) {
        //         this.listoffilters.push(new SComparison ("IS", vvalue[i].IS));
        //     } else if (vvalue[i].hasOwnProperty("LT")) {
        //         this.listoffilters.push(new MComparison ("LT", vvalue[i].LT));
        //     } else if (vvalue[i].hasOwnProperty("GT")) {
        //         this.listoffilters.push(new MComparison ("GT", vvalue[i].GT));
        //     } else if (vvalue[i].hasOwnProperty("EQ")) {
        //         this.listoffilters.push(new MComparison ("EQ", vvalue[i].EQ));
        //     } else if (vvalue[i].hasOwnProperty("NOT")) {
        //         this.listoffilters.push(new Negation ("NOT", vvalue[i].NOT));
        //     } else {
        //         throw new InsightError("Invalid Field");
        //     }
        // }
    }

    protected applyFilter(ds: DataSets): Promise<any[]> {
        return undefined;
    }

    protected isValid(insDs: InsightDataset[]): Promise<boolean> {
        return undefined;
    }
}
