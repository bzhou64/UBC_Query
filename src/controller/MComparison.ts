import Filter from "./Filter";
import DataSets from "./DataSets";
import {InsightDataset, InsightError} from "./IInsightFacade";
import Section from "./Section";
import InsightFacade from "./InsightFacade";

export default class MComparison extends Filter {
    // "courses_bla" : value
    private field: string; // "courses_bla"
    private fieldvalue: any; // value
    private datasetToSearch: string; // courses
    private fieldToSearch: string; // bla
    // private MCOMPARATOR: string;

    constructor(kkey: string, vvalue: any) {
        super(kkey, vvalue);
        // this.MCOMPARATOR = kkey;
        this.field = Object.keys(vvalue)[0]; // Will return the main key "LT | GT | EQ"
        this.fieldvalue = vvalue[this.field];
    }
    public applyFilter(ds: DataSets, resultSoFar: any[], insF: InsightFacade): Promise<any[]> {
        let tempResultSoFar: any[] = [];
        try {
            if (this.isFieldValid(this.field)) {
                this.datasetToSearch = this.field.substr(0, this.field.indexOf("_"));
                this.fieldToSearch = this.field.substr((this.field.indexOf("_") + 1));
                insF.listDatasets().then((insD) => {
                    this.isValid(insD).then((result) => {
                        if (result) {
                            let sections: { [index: string]: Section } = ds.datasets[this.datasetToSearch].sections;
                            if (super.key === "LT") {
                                Object.keys(sections).map((key) => {
                                    if (sections[key].mfield[this.fieldToSearch] < this.fieldvalue) {
                                        tempResultSoFar.push(sections[key]);
                                    }
                                });
                            }
                            if (super.key === "EQ") {
                                Object.keys(sections).map((key) => {
                                    if (sections[key].mfield[this.fieldToSearch] === this.fieldvalue) {
                                        tempResultSoFar.push(sections[key]);
                                    }
                                });
                            } else {
                                Object.keys(sections).map((key) => {
                                    if (sections[key].mfield[this.fieldToSearch] > this.fieldvalue) {
                                        tempResultSoFar.push(sections[key]);
                                    }
                                });
                            }
                        }
                    });
                });
            }
            return new Promise<any[]>((resolve) => {
                resolve (tempResultSoFar);
            });
        } catch (e) {
            throw new InsightError(e);
        }
    }
    // checks for 3 things:
    // is the fieldvalue a number
    // is the key to search a valid key
    // is the dataset to search a valid dataset
    protected isValid(insDs: InsightDataset[]): Promise<boolean> {
        if (isNaN(this.fieldvalue)) {
            throw new InsightError("Numeric Comparison using Non Numeric field");
        }
        /*if (!MComparison.isKeyValid(this.MCOMPARATOR)) {
            throw new InsightError("MCOMPARATOR is invalid");
        }*/
        if (!MComparison.isFieldToSearchValid(this.fieldToSearch)) {
            throw new InsightError("Key given is not a valid key");
        }
        if (!this.isDatasetRequestValid(insDs)) {
            throw new InsightError("Dataset requested is not in database");
        }
        return undefined;
    }

    // checks if the given field has the correct syntax: id_key
    protected isFieldValid(field: string): boolean {
        if (!MComparison.isSKeyValid(field)) {
            throw new InsightError("skey is not valid");
        } else {
            return true;
        }
    }
    // helper function to check if the field given to the constructor is valid.
    private static isSKeyValid(fv: string): boolean {
        return !((fv.indexOf("_") === -1) || (fv.indexOf("_") === 0));
    }

    private static isFieldToSearchValid(fts: string) {
        return ((fts === "avg") || (fts === "pass") || (fts === "fail") || (fts === "audit") || (fts === "year"));
    }

    // helper function to check if dataset requested is in database
    private isDatasetRequestValid(insDs: InsightDataset[]): boolean {
        for (let ids of insDs) {
            if (ids.id === this.datasetToSearch) {
                return true;
            }
        }
        return false;
    }

    /*private static isKeyValid(mcomp: string): boolean {
        return ((mcomp === "LT") || (mcomp === "GT") || (mcomp === "EQ"));
    }*/

}
