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
        for (let property of vvalue) {
            if (vvalue.hasOwnProperty("AND")) {
                this.listoffilters.push(new LogicComparison ("AND", vvalue.AND));
            } else if (vvalue.hasOwnProperty("OR")) {
                this.listoffilters.push(new LogicComparison ("OR", vvalue.OR));
            } else if (vvalue.hasOwnProperty("IS")) {
                this.listoffilters.push(new SComparison ("IS", vvalue.IS));
            } else if (vvalue.hasOwnProperty("LT")) {
                this.listoffilters.push(new MComparison ("LT", vvalue.LT));
            } else if (vvalue.hasOwnProperty("GT")) {
                this.listoffilters.push(new MComparison ("GT", vvalue.GT));
            } else if (vvalue.hasOwnProperty("EQ")) {
                this.listoffilters.push(new MComparison ("EQ", vvalue.EQ));
            } else if (vvalue.hasOwnProperty("NOT")) {
                this.listoffilters.push(new Negation ("NOT", vvalue.NOT));
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
    public applyFilter(ds: DataSet, resultSoFar: any[]): Promise<any[]> {
        try {
            let tempResultSoFar: any[];
            this.isValid().then((result) => {
                if (result) {
                    if (super.key === "AND") {
                        let tempFilterResults: any[] = [];
                        this.listoffilters.forEach((filter) => {
                            filter.applyFilter(ds, resultSoFar).then((thing) => {
                                tempFilterResults.push(thing);
                            });
                        });
                        tempResultSoFar = tempFilterResults[0];
                        for (let res of tempFilterResults) {
                            tempResultSoFar = tempResultSoFar.filter((val) => res.includes(val));
                        }
                    }
                    if (super.key === "OR") {
                        let tempFilterResults: any[] = [];
                        this.listoffilters.forEach((filter) => {
                            filter.applyFilter(ds, resultSoFar).then((thing) => {
                                tempFilterResults.push(thing);
                            });
                        });
                        // made a set so that duplicates won't be added
                        let tempSet = new Set();
                        for (let res of tempFilterResults) {
                            for (let val of res) {
                                tempSet.add(val);
                            }
                        }
                        for (let setVal of tempSet) {
                            tempResultSoFar.push(setVal);
                        }
                    }
                }
            });
            return new Promise<any[]>((resolve) => {
                resolve(tempResultSoFar);
            });
            } catch (e) {
            throw new InsightError(e);
        }
    }

    protected isValid(): Promise<boolean> {
        if ((super.key !== "AND") && (super.key !== "OR")) {
            throw new InsightError("LOGIC given is invalid");
        }
        return new Promise<boolean>((resolve) => {
            resolve (true);
        });
    }
}
