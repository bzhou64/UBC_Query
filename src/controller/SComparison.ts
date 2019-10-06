import Filter from "./Filter";
import DataSets from "./DataSets";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Section from "./Section";
import InsightFacade from "./InsightFacade";
import DataSet from "./DataSet";
import Log from "../Util";

export default class SComparison extends Filter {
    // "courses_bla" : value
    private field: string; // "courses_bla"
    private fieldvalue: any; // value
    private datasetToSearch: string; // courses
    private fieldToSearch: string; // bla
    // private SCOMPARATOR: string;
    private datasetGiven: string;
    private tempResultSoFar: any[] = [];

    constructor(kkey: string, vvalue: any) {
        super(kkey, vvalue);
        // this.SCOMPARATOR = kkey;
        if (typeof(vvalue) !== "object" || Object.keys(vvalue).length !== 1) {
            throw new InsightError("Invalid format for M comp");
        }
        this.field = Object.keys(vvalue)[0];
        this.fieldvalue = vvalue[this.field];
    }

    public applyFilter(ds: DataSet, resultSoFar: any[]): any[] {
        this.datasetGiven = ds.id;
        try {
            if (this.isFieldValid(this.field)) {
                this.datasetToSearch = this.field.substr(0, this.field.indexOf("_"));
                this.fieldToSearch = this.field.substr((this.field.indexOf("_") + 1));
                if (this.isValid()) {
                    let sections: { [index: string]: Section } = ds.sections;
                    if (this.fieldvalue.includes("*")) {
                        this.asteriskHelper(sections);
                    } else {
                        for (let [str, Sec] of Object.entries(sections)) {
                            let tempSec: any = Sec;
                            if (tempSec[this.fieldToSearch] === this.fieldvalue) {
                                this.tempResultSoFar.push(Sec);
                            }
                        }
                        }
                    }
                }
            return this.tempResultSoFar;
            } catch (e) {
            throw new InsightError(e);
        }
    }

    // checks for 4 things:
    // is the field inputted a string
    // is the asterisk at the beginning or the end of the string or in the middle
    // is the key given a valid key
    // is the dataset requested in the database
    protected isValid(): boolean {
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
            return true;
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
            return ((secs.substr(secs.length - valueRequestedLength) === fieldval.substr(1, valueRequestedLength)) ||
                (secs.substr(0, valueRequestedLength) === fieldval.substr(1, valueRequestedLength)));
        } else {
            return false;
        }
    }

    private static asteriskAtStartHelper(secs: string, fieldval: string): boolean {
        let valueRequestedLength: number = fieldval.length - 1;
        if (secs.length >= valueRequestedLength) {
            return secs.substr(secs.length - valueRequestedLength) === fieldval.substr(1);
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

    private static isAsteriskOnBothEnd(fieldvalue: string): boolean {
        return ((fieldvalue.substr(0, 1) === "*") &&
            (fieldvalue.substr(fieldvalue.length - 1) === "*"));
    }

    private asteriskHelper(sections: {[index: string]: Section}) {
        if (this.fieldvalue === "*") {
            for (let [str, Sec] of Object.entries(sections)) {
                this.tempResultSoFar.push(Sec);
            }
        }
        if (SComparison.isAsteriskOnBothEnd(this.fieldvalue)) {
            for (let [str, Sec] of Object.entries(sections)) {
                let tempSec: any = Sec;
                if (SComparison.twoAsterisksHelper(tempSec[this.fieldToSearch],
                    this.fieldvalue)) {
                    this.tempResultSoFar.push(Sec);
                }
            }
        }
        if (this.fieldvalue.substr(0, 1) === "*") {
            for (let [str, Sec] of Object.entries(sections)) {
                let tempSec: any = Sec;
                if (SComparison.asteriskAtStartHelper(tempSec[this.fieldToSearch],
                    this.fieldvalue)) {
                    this.tempResultSoFar.push(Sec);
                }
            }
        }

        if (this.fieldvalue.substr(this.fieldvalue.length - 1)) {
            for (let [str, Sec] of Object.entries(sections)) {
                let tempSec: any = Sec;
                if (SComparison.asteriskAtEndHelper(tempSec[this.fieldToSearch],
                    this.fieldvalue)) {
                    this.tempResultSoFar.push(Sec);
                }
            }
        }
    }
}