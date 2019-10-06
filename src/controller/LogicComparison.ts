import Filter from "./Filter";
import DataSets from "./DataSets";
import {InsightDataset, InsightError} from "./IInsightFacade";
import MComparison from "./MComparison";
import SComparison from "./SComparison";
import Negation from "./Negation";
import InsightFacade from "./InsightFacade";
import DataSet from "./DataSet";
import Section from "./Section";

export default class LogicComparison extends Filter {

    private listoffilters: Filter[];
    /*
    @precondition : Will be passed an AND or OR object
     */
    constructor(kkey: string, vvalue: any) {
        super(kkey, vvalue);
        this.listoffilters = [];
        for (let property of vvalue) {
            if (property.hasOwnProperty("AND")) {
                this.listoffilters.push(new LogicComparison ("AND", property.AND));
            } else if (property.hasOwnProperty("OR")) {
                this.listoffilters.push(new LogicComparison ("OR", property.OR));
            } else if (property.hasOwnProperty("IS")) {
                this.listoffilters.push(new SComparison ("IS", property.IS));
            } else if (property.hasOwnProperty("LT")) {
                this.listoffilters.push(new MComparison ("LT", property.LT));
            } else if (property.hasOwnProperty("GT")) {
                this.listoffilters.push(new MComparison ("GT", property.GT));
            } else if (property.hasOwnProperty("EQ")) {
                this.listoffilters.push(new MComparison ("EQ", property.EQ));
            } else if (property.hasOwnProperty("NOT")) {
                this.listoffilters.push(new Negation ("NOT", property.NOT));
            } else {
                throw new InsightError("Invalid Field");
            }
        }
        /*for (let i = 0; i < vvalue.length; i++) {
            if (vvalue[i].hasOwnProperty("AND")) {
                this.listoffilters.push(new LogicComparison ("AND", vvalue[i].AND));
            } else if (vvalue[i].hasOwnProperty("OR")) {
                this.listoffilters.push(new LogicComparison ("OR", vvalue[i].OR));
            } else if (vvalue[i].hasOwnProperty("IS")) {
                this.listoffilters.push(new SComparison ("IS", vvalue[i].IS));
            } else if (vvalue[i].hasOwnProperty("LT")) {
                this.listoffilters.push(new MComparison ("LT", vvalue[i].LT));
            } else if (vvalue[i].hasOwnProperty("GT")) {
                this.listoffilters.push(new MComparison ("GT", vvalue[i].GT));
            } else if (vvalue[i].hasOwnProperty("EQ")) {
                this.listoffilters.push(new MComparison ("EQ", vvalue[i].EQ));
            } else if (vvalue[i].hasOwnProperty("NOT")) {
                this.listoffilters.push(new Negation ("NOT", vvalue[i].NOT));
            } else {
                throw new InsightError("Invalid Field");
            }
        }*/
    }
    // if key is "AND", get the arrays of all the filters within this logic comparison or catch any errors
    // throw by the filter methods. If all filter returns an array, update tempResultSoFar by first setting it to the
    // first filter array, and then comparing tempResultSoFar and all the other filter results and keeping only the
    // sections that are in all arrays.
    // if key is "OR", do the same as "AND" but update tempResultSoFar so that
    public applyFilter(ds: DataSet, resultSoFar: any[]): any[] {
        try {
            // let tempResultSoFar: any[];
                if (this.isValid()) {
                    if (this.key === "AND") {
                        let tempFilterResults: any[] = [];
                        this.listoffilters.forEach((filter) => {
                                tempFilterResults.push(filter.applyFilter(ds, resultSoFar));
                        });
                        // tempResultSoFar = tempFilterResults[0];
                        for (let res of tempFilterResults) {
                            resultSoFar = resultSoFar.filter((val) => res.includes(val));
                        }
                    }
                    if (this.key === "OR") {
                        let tempFilterResults: any[] = [];
                        this.listoffilters.forEach((filter) => {
                                tempFilterResults.push(filter.applyFilter(ds, resultSoFar));
                        });
                        resultSoFar = [];
                        for (let res of tempFilterResults) {
                            for (let val of res) {
                                if (!resultSoFar.includes(val)) {
                                    resultSoFar.push(val);
                                }
                            }
                        }
                    }
                }
                return resultSoFar;
            } catch (e) {
            throw new InsightError(e);
        }
    }

    protected isValid(): boolean {
        if ((this.key !== "AND") && (this.key !== "OR")) {
            throw new InsightError("LOGIC given is invalid");
        } else {
            return true;
        }
    }
}
