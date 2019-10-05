import Filter from "./Filter";
import DataSets from "./DataSets";
import {InsightDataset, InsightError} from "./IInsightFacade";
import MComparison from "./MComparison";
import SComparison from "./SComparison";
import Negation from "./Negation";
import InsightFacade from "./InsightFacade";

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
    // if key is "AND", get the arrays of all the filters within this logic comparison or catch any errors
    // throw by the filter methods. If all filter returns an array, update tempResultSoFar by first setting it to the
    // first filter array, and then comparing tempResultSoFar and all the other filter results and keeping only the
    // sections that are in all arrays.
    // if key is "OR", do the same as "AND" but update tempResultSoFar so that
    public applyFilter(ds: DataSets, resultSoFar: any[], insF: InsightFacade): Promise<any[]> {
        try {
            let tempResultSoFar: any[];
            insF.listDatasets().then((insD) => {
               this.isValid(insD).then((result) => {
                    if (result) {
                        if (super.key === "AND") {
                            let tempFilterResults: any[] = [];
                            this.listoffilters.forEach((filter) => {
                                filter.applyFilter(ds, resultSoFar, insF).then((thing) => {
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
                                filter.applyFilter(ds, resultSoFar, insF).then((thing) => {
                                    tempFilterResults.push(thing);
                                });
                            });
                            // this can sometimes filter out a valid result. THinking of a fix
                            // tempResultSoFar = tempFilterResults[0];
                            let filteredByAccident: any[] = [];
                            for (let res of tempFilterResults) {
                                tempResultSoFar = tempResultSoFar.filter((val) => !res.includes(val));
                            }
                        }
                        }
                    });
                });
            return new Promise<any[]>((resolve) => {
                resolve(tempResultSoFar);
            });
            } catch (e) {
            throw new InsightError(e);
        }
    }

    protected isValid(insDs: InsightDataset[]): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            resolve (true);
        });
    }
}
