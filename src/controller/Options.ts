
import {InsightError} from "./IInsightFacade";
import Log from "../Util";
import Columns from "./Columns";
import Sorting from "./Sorting";

export default class Options {
    /*
    This is the entity which handles the OPTIONS operations in the QUERY
    columns - the columns of the dataset that will be shown in the query results
    order - the column which the query result must sort by
    TODO:
        Build The COLUMNS and SORT OBJECTS, DEPRECATE THIS USE INTO AN INTERFACE (Details below)
        Ideally, Options should be an API using Columns and Sorting to return a sorted dataset
        A (Grouped/Filtered Dataset),(Options Clause) -> [OPTIONS]
        B [OPTIONS] -> (Desired Columns),(Grouped/Filtered Dataset) -> [COLUMNS] -> (Dataset with Only Selected Columns)
        C (Dataset with Only Selected Columns),(Desired Order Key(s))-> [SORTING] -> (Dataset Sorted)
     */
    // private columns: any[];
    private columns: Columns; // New object that will perform Procedure B
    private uds: any[];
    private order: Sorting;
    /*
    private listDatasets: string[];
    private listColumns = ["dept", "id", "avg", "instructor", "title", "pass", "fail", "audit", "uuid", "year"];
    private datasetId: string;
    */
    constructor(options: any, uds: any[]) {
        // TODO: Query Should Test If There's Both 0 or 5000 throw an error for both
        // Test for syntactical correctness here. Throw an error only then.
        this.uds = uds;
        try {
            if (options.hasOwnProperty("COLUMNS")) {
                this.columns = new Columns(uds, options.COLUMNS);
            } else {
                throw new InsightError("No Column Field Specified");
            }
        } catch (er) {
           throw new InsightError("No Column Object Created: " + er.message());
        }
        /*
        if (options.hasOwnProperty("COLUMNS")) {
            this.columns = new Columns(uds, options.COLUMNS);
        } else {
            throw new InsightError("No Column Field Specified");
        } */
        // TODO: ADD ORDER
        // this.order = options.ORDER;
        /*
        this.listDatasets = listDatasets;
        this.datasetId = datesetId;
         */
    }

    /* Test for Validity

     */
    /*
      @param: Updated data set (UDS) that has been filtered (Ask Bill what's returned in his struct)
      if JSON array don't stringify and manipulate directly by key strings, if Objects, stringify
      the UDS before manipulating.
      @specs: Apply both the columnar and order sorting
      @output: Expected data set as string
     */
    public applyColumnsAndOrder(): any[] {
        let records: any[] = [];
        if (this.columns.isColumnarValid(Object.keys(this.uds[0]))) {
            records = this.columns.applyColumns();
        } else {
            throw new InsightError("Invalid Column Request");
        }
        // TODO: ADD SORT FUNCTIONALITY
        return records;
    }

    // Helper that allows us to make the record
    // outputs a JSON object syntax {"field1":value1, "field2":value2, "field3":value3, ... "fieldn":valuen}
    /*
    private selectColumns(ur: any): string {
        let jsonObj: string = "{ ";
        for (let i = 0; i < this.columns.length - 1; i++) {
            let thisfield: string = "\"";
            let valf: string = "";
            if (isNaN(ur[this.columns[i].toString()])) {
                valf.concat("\"", ur[this.columns[i].toString()], "\"");
            } else {
                valf.concat(ur[this.columns[i].toString()]);
            }
            thisfield.concat(this.columns[i].toString(), "\": ", valf);
            jsonObj.concat(thisfield, ", ");
        }
        let vals: string = "";
        if (isNaN(ur[this.columns[this.columns.length - 1].toString()])) {
            vals.concat("\"", ur[this.columns[this.columns.length - 1].toString()], "\"");
        } else {
            vals.concat(ur[this.columns[this.columns.length - 1].toString()]);
        }
        jsonObj.concat("\"", this.columns[this.columns.length - 1].toString(), "\"");
        jsonObj.concat(": ", vals, " }");
        return jsonObj;
    }
     */
    // Helper that creates new objects of the record with only columns in question
    /*
        @param : a record from the filtered dataset
        @spec  : convert into object with only selected columns as properties
        @output: an object with select-column fields
     */
    /*
    private selectColumnsAsObj(udr: any): any {
        let newData: any = {};
        this.listColumns.forEach((col) => {
            let colLong = this.datasetId + "_" + col;
            if (this.columns.includes(colLong)) {
                newData[colLong] = udr[col];
            }
});
     *//*
        // let obje: {[k: string]: any} = {};
        // for (let column in this.columns) {
        //   obje[column.toString()] = udr[column.toString()];
        // }
        return newData;
    }

    // Helper that tests whether columns and order provided is legal
    /*
        @param : A list of datasets in scope
        @spec  : test if COLUMNS and ORDER are valid for the query
        @output: true if valid, error if not valid (with description)
     */
    /*
    private isValid(datasetsList: string[]): boolean {
        let valid: boolean = true;
        // test one: order key needs to be in column list
        if (this.order !== undefined) {
            if (!this.columns.includes(this.order)) {
                valid = false;
            }
        }
        // test two: column has to exist in list of columns
        for (const col of this.columns) {
            let split = col.split("_");
            if (split.length !== 2 || (!this.listColumns.includes(split[1]))) {
                valid = false;
            }
        }
        // test three: all columns have to be in the same dataset+
        if (!this.allTheSame()) {
            valid = false;
        }
        if (valid) {
            return true;
        }
    }

    // Helper that tests whether all fields are in the same dataset
    /*
        @param : none
        @spec  : test if all columns in column selected are of the same dataset
        @output: true if valid, false if not
     *//*
    private allTheSame(): boolean {
        // INTUITION: size of set should be = 1 if they are all in the same dataset "courses_xxx"
        let queryFieldSet = new Set();
        for (const col of this.columns) {
            let temp = col.split("_");
            queryFieldSet.add(temp[0]);
        }
        if (queryFieldSet.size === 1) {
            return true;
        }
        return false;
    }
    */
}
