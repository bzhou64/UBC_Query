import Filter from "./Filter";
import DataSets from "./DataSets";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Section from "./Section";
import InsightFacade from "./InsightFacade";
import DataSet from "./DataSet";

export default class SComparison extends Filter {
    // "courses_bla" : value
    private field: string; // "courses_bla"
    private fieldvalue: any; // value
    private datasetToSearch: string; // courses
    private fieldToSearch: string; // bla
    // private SCOMPARATOR: string;
    private datasetGiven: string;

    constructor(kkey: string, vvalue: any) {
        super(kkey, vvalue);
        // this.SCOMPARATOR = kkey;
        this.field = Object.keys(vvalue)[0];
        this.fieldvalue = vvalue[this.field];
    }

    // This should be good.
    public applyFilter(ds: DataSet, resultSoFar: any[]): Promise<any[]> {
        let tempResultSoFar: any[] = [];
        this.datasetGiven = ds.id;
        try {
            if (this.isFieldValid(this.field)) {
                this.datasetToSearch = this.field.substr(0, this.field.indexOf("_"));
                this.fieldToSearch = this.field.substr((this.field.indexOf("_") + 1));
                this.isValid().then((result) => {
                        if (result) {
                            let sections: { [index: string]: Section } = ds.sections;
                            if (this.fieldvalue.includes("*")) {
                                if (this.fieldvalue === "*") {
                                    Object.keys(sections).map((key) => {
                                        tempResultSoFar.push(sections[key]);
                                    });
                                }
                                if ((this.fieldvalue.substr(0, 1) === "*") &&
                                    (this.fieldvalue.substr(this.fieldvalue.length() - 1) === "*")) {
                                    Object.keys(sections).map((key) => {
                                        if (SComparison.twoAsterisksHelper(
                                            sections[key].sfield[this.fieldToSearch], this.fieldvalue)) {
                                            tempResultSoFar.push(sections[key]);
                                        }
                                    });
                                }
                                if (this.fieldvalue.substr(0, 1) === "*") {
                                    Object.keys(sections).map((key) => {
                                        if (SComparison.asteriskAtStartHelper(sections[key].sfield[this.fieldToSearch],
                                            this.fieldvalue)) {
                                            tempResultSoFar.push(sections[key]);
                                        }
                                    });
                                }
                                if (this.fieldvalue.substr(this.fieldvalue.length - 1)) {
                                    Object.keys(sections).map((key) => {
                                        if (SComparison.asteriskAtEndHelper(sections[key].sfield[this.fieldToSearch],
                                            this.fieldvalue)) {
                                            tempResultSoFar.push(sections[key]);
                                        }
                                    });
                                }
                            }

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
    protected isValid(): Promise<boolean> {
        if (!isNaN(this.fieldvalue)) {
            throw new InsightError("String Comparison using Numeric field");
        }
        if (!SComparison.isKeyValid(this.key)) {
            throw new InsightError("SCOMPARATOR given is invalid");
        }
        if (this.fieldvalue === null) {
            throw new InsightError("String given for search is NULL");
        }
        if (this.fieldvalue.includes("*") && !SComparison.isAsteriskAtRightSpot(this.fieldvalue)) {
            throw new InsightError("Asterisk not at the beginning or end");
        }
        if (!SComparison.isFieldToSearchValid(this.fieldToSearch)) {
            throw new InsightError("The key given is not a valid key");
        }
        if (!this.isDatasetRequestValid()) {
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
    private static isAsteriskAtRightSpot(fieldvalue: any): boolean {
        return (fieldvalue.substr(fieldvalue.length - 1) === "*") || (fieldvalue.substr(0, 1) === "*");
    }

    private static isFieldToSearchValid(fts: string) {
        return ((fts === "dept") || (fts === "id") || (fts === "instructor") || (fts === "title") || (fts === "uuid"));
    }

    // helper function to check if dataset requested is in database
    private isDatasetRequestValid(): boolean {
        return this.datasetToSearch === this.datasetGiven;
    }

    private static isKeyValid(scomp: string): boolean {
        return scomp === "IS";
    }

    private static twoAsterisksHelper(secs: string, fieldval: string): boolean {
        let valueRequestedLength: number = fieldval.length - 2;
        if (secs.length >= valueRequestedLength) {
            return ((secs.substr(valueRequestedLength - 1) === fieldval.substr(1, valueRequestedLength)) ||
                (secs.substr(0, valueRequestedLength) === fieldval.substr(1, valueRequestedLength)));
        } else {
            return false;
        }
    }

    private static asteriskAtStartHelper(secs: string, fieldval: string): boolean {
        let valueRequestedLength: number = fieldval.length - 1;
        if (secs.length >= valueRequestedLength) {
            return secs.substr(valueRequestedLength - 1) === fieldval.substr(1);
        } else {
            return false;
        }
    }

    private static asteriskAtEndHelper(secs: string, fieldval: string): boolean {
        let valueRequestedLength: number = fieldval.length - 1;
        if (secs.length >= valueRequestedLength) {
            return secs.substr(0, valueRequestedLength) === fieldval.substr(0, valueRequestedLength);
        } else {
            return false;
        }
    }
}
