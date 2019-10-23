import Filter from "./Filter";
import DataSets from "./DataSets";
import {InsightDataset, InsightError} from "./IInsightFacade";
import Section from "./Section";
import InsightFacade from "./InsightFacade";
import DataSet from "./DataSet";

export default class MComparison extends Filter {
    // "courses_bla" : value
    private field: string; // "courses_bla"
    private fieldvalue: any; // value
    private datasetToSearch: string; // courses
    private fieldToSearch: string; // bla
    private datasetGiven: string;
    private tempResultSoFar: any[] = [];

    constructor(kkey: string, vvalue: any) {
        super(kkey, vvalue);
        if (typeof(vvalue) !== "object" || Object.keys(vvalue).length !== 1) {
            throw new InsightError("Invalid format for M comp");
        }
        this.field = Object.keys(vvalue)[0]; // Will return the main key "LT | GT | EQ"
        this.fieldvalue = vvalue[this.field];
        if (((this.field.indexOf("_") === -1) || (this.field.indexOf("_") === 0))) {
            throw new InsightError("skey given is not valid");
        } else {
            this.datasetToSearch = this.field.substr(0, this.field.indexOf("_"));
            this.fieldToSearch = this.field.substr((this.field.indexOf("_") + 1));
        }
    }

    public applyFilter(ds: DataSet, resultSoFar: any[]): any[] {
        this.datasetGiven = ds.id;
        try {
                if (this.isValid()) {
                    let sections: { [index: string]: Section } = ds.records;
                    if (this.key === "LT") {
                        this.lessThanHelper(sections);
                    } else if (this.key === "EQ") {
                        this.equalHelper(sections);
                    } else {
                        this.greaterThanHelper(sections);
                    }
                }
                return this.tempResultSoFar;
        } catch (e) {
            throw new InsightError(e);
        }
    }

    // checks for 4 things:
    // is the fieldvalue a Number
    // is the key to search a valid key
    // is the field to search a valid field
    // is the dataset to search a valid dataset
    protected isValid(): boolean {
        if (typeof(this.fieldvalue) !== "number") {
            throw new InsightError("Numeric comparison using Non Numeric Field");
        }
        if (!MComparison.isKeyValid(this.key)) {
            throw new InsightError("MCOMPARATOR is invalid");
        }
        if (!MComparison.isFieldToSearchValid(this.fieldToSearch)) {
            throw new InsightError("Key given is not a valid key");
        }
        if (!this.isDatasetRequestValid()) {
            throw new InsightError("Dataset requested is not in database");
        } else {
            return true;
        }
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
    private isDatasetRequestValid(): boolean {
        return this.datasetToSearch === this.datasetGiven;
    }

    private static isKeyValid(mcomp: string): boolean {
        return ((mcomp === "LT") || (mcomp === "GT") || (mcomp === "EQ"));
    }

    private lessThanHelper(sections: { [index: string]: Section }) {
        for (let [str, Sec] of Object.entries(sections)) {
            let tempSec: any = Sec;
            if (tempSec[this.fieldToSearch] < this.fieldvalue) {
                this.tempResultSoFar.push(Sec);
            }
        }
    }

    private equalHelper(sections: { [index: string]: Section }) {
        for (let [str, Sec] of Object.entries(sections)) {
            let tempSec: any = Sec;
            if (tempSec[this.fieldToSearch] === this.fieldvalue) {
                this.tempResultSoFar.push(Sec);
            }
        }
    }

    private greaterThanHelper(sections: { [index: string]: Section }) {
        for (let [str, Sec] of Object.entries(sections)) {
            let tempSec: any = Sec;
            if (tempSec[this.fieldToSearch] > this.fieldvalue) {
                this.tempResultSoFar.push(Sec);
            }
        }
    }

}
