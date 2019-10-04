import Filter from "./Filter";
import DataSets from "./DataSets";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Section from "./Section";
import InsightFacade from "./InsightFacade";

export default class SComparison extends Filter {
    // "courses_bla" : value
    private field: string; // "courses_bla"
    private fieldvalue: any; // value
    private datasetToSearch: string; // courses
    private fieldToSearch: string; // bla
    private SCOMPARATOR: string;

    constructor(kkey: string, vvalue: any) {
        super(kkey, vvalue);
        this.SCOMPARATOR = kkey;
        this.field = Object.keys(vvalue)[0];     // Will return the main key "IS"
        this.fieldvalue = vvalue[this.field];
    }

    // This should be good. Will add asterisk as wildcards later.
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
                            /*for (let key in sections) {
                                if (sections[key].sfield[this.fieldToSearch] === this.fieldvalue) {
                                    tempResultSoFar.push(sections[key]);
                                }
                            }*/
                            Object.keys(sections).map((key) => {
                                if (sections[key].sfield[this.fieldToSearch] === this.fieldvalue) {
                                    tempResultSoFar.push(sections[key]);
                                }
                            });
                        }
                    });
                });
            }
            return new Promise((resolve, reject) => {
                resolve(tempResultSoFar);
            });
        } catch (e) {
            throw new InsightError(e);
        }
    }

    // checks for 4 things:
    // is the field inputted a string
    // is the asterisk at the beginning or the end of the string or in the middle
    // is the key given a valid key
    // is the dataset requested in the database
    protected isValid(insDs: InsightDataset[]): Promise<boolean> {
        if (!isNaN(this.fieldvalue)) {
            throw new InsightError("String Comparison using Numeric field");
        }
        if (this.fieldvalue.includes("*") && SComparison.isAsteriskAtWrongSpot(this.fieldvalue)) {
            throw new InsightError("Asterisk not at the beginning or end");
        }
        if (!SComparison.isFieldToSearchValid(this.fieldToSearch)) {
            throw new InsightError("The key given is not a valid key");
        }
        if (!this.isDatasetRequestValid(insDs)) {
           throw new InsightError("The dataset requested is not in the database");
        } else {
            return new Promise<boolean>((resolve) => {
                resolve(true);
            });
        }
    }

    // checks if the given field has the correct syntax: id_key
    protected isFieldValid(field: string): boolean {
        if (!SComparison.isSKeyValid(field)) {
            throw new InsightError("skey is not valid");
        } else {
            return true;
        }
    }
    // helper function to check if the field given to the constructor is valid.
    private static isSKeyValid(fv: string): boolean {
        return !((fv.indexOf("_") === -1) || (fv.indexOf("_") === 0));
    }

    // helper function to check if an asterisk is not at the front or end of a string
    private static isAsteriskAtWrongSpot(fieldvalue: any): boolean {
        return (fieldvalue.substr(fieldvalue.length - 1) !== "*") || (fieldvalue.substr(0, 1) !== "*");
    }

    private static isFieldToSearchValid(fts: string) {
        return ((fts === "dept") || (fts === "id") || (fts === "instructor") || (fts === "title") || (fts === "uuid"));
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
}
