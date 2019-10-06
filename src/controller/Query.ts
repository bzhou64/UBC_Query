/*
This is the query class that will contain methods which will
1. parse JSON queries
2. build the hierarchy
3. output JSON result
4. error handling (nice to have)
- Should be used in InsightFacade.performQuery()
 */

import {InsightError} from "./IInsightFacade";
import DataSets from "./DataSets";
import Filter from "./Filter";
import LogicComparison from "./LogicComparison";
import SComparison from "./SComparison";
import MComparison from "./MComparison";
import Negation from "./Negation";
import DataSet from "./DataSet";

export default class Query {
    private queryObj: any;
    private datasets: DataSets;
    private filter: Filter;
    private datasetId: string;
    private dataset: DataSet;
    constructor(query: any, datasets: DataSets) {
        /* Should we include error handling here - if syntactically incorrect JSON
           Maybe just catch any error thrown
        */
        // DONE
        try {
            this.queryObj = JSON.parse(query);
        } catch (e) {
            throw (new InsightError("invalid query json formatting"));
        }
        this.datasets = datasets;
        let options = this.queryObj["OPTIONS"];
        if (options === undefined) {
            throw (new InsightError("OPTIONS clause missing in query"));
        }
        if (Object.keys(options).length !== 2) {
            throw (new InsightError("Too many or too few OPTIONS"));
        }
        let columns = options["COLUMNS"];
        if (columns === undefined && !Array.isArray(columns)) {
            throw (new InsightError("Columns missing from options or not an array"));
        }
        let order = options["ORDER"];
        if (order === undefined) {
            throw (new InsightError("Order missing from options"));
        }
        if (columns.length === 0) {
            throw (new InsightError("No column specified in options"));
        }
        let columnsOrder = columns.push(order);
        this.datasetId = this.datasetIdOptions(columnsOrder);
        if (this.datasetId === null) {
            throw (new InsightError("Querying multiple datasets in OPTIONS"));
        }
        if (!this.datasets.datasets.hasOwnProperty(this.datasetId)) {
            throw (new InsightError("Querying non-existent dataset in OPTIONS"));
        }
        this.dataset = this.datasets.datasets[this.datasetId];
        // Check where stuff
        let where = this.queryObj["WHERE"];
        if (where === undefined) {
            throw (new InsightError("WHERE missing in query"));
        }
        if (Object.keys(where).length !== 1) {
            throw (new InsightError("Too many keys in where"));
        }
        let whereOpt = Object.keys(where)[0];
        if (whereOpt === "AND") {
            this.filter = new LogicComparison ("AND", where.whereOpt);
        } else if (whereOpt === "OR") {
            this.filter = new LogicComparison ("OR", where.whereOpt);
        } else if (whereOpt === "IS") {
            this.filter = new SComparison ("IS", where.whereOpt);
        } else if (whereOpt === "LT") {
            this.filter = new MComparison ("LT", where.whereOpt);
        } else if (whereOpt === "GT") {
            this.filter = new MComparison ("GT", where.whereOpt);
        } else if (whereOpt === "EQ") {
            this.filter = new MComparison ("EQ", where.whereOpt);
        } else if (whereOpt === "NOT") {
            this.filter = new Negation ("NOT", where.whereOpt);
        } else {
            throw new InsightError("Invalid WHERE field");
        }
        // this.filter.applyFilter(this.dataset,[],);
    }
    private datasetIdOptions(columnsOrder: []): string {
        // INTUITION: size of set should be = 1 if they are all in the same dataset "courses_xxx"
        let colName = "";
        for (const col in columnsOrder) {
            let currName = col.split("_")[0];
            if (colName !== "" && currName !== colName) {
                return null;
            }
        }
        return colName;
    }
    // TODO: Function that tests validity of query
    /*
    Preconditions: Query is syntactically valid - No errors in the JSON format
    Specification: show whether query is valid
    Output: returns true if it's valid, false if not
     */
    public isQueryValid(): boolean {
        /*
        Conditions for validity: each must be a function eventually
        1. Must not draw keys from more than one dataset - moreThanOne()
        2. Must not call fields that do not exist in the dataset - WHERE - noFieldExistsWhere
        3. Must not call fields that do not exist in the dataset - OPTIONS - noFieldExistOptions
        3. Must maintain type referential - text search in a num field is not allowed
        4. Must maintain type referential - num search in a text field is not allowed
        5. Logic Operators only deal with numeric fields and values
         */
       return false;
    }
    private moreThanOne(): boolean {
        return false;
    }
    private noFieldExistsWhere(): boolean {
        return false;
    }
    private noFieldExistsOptions(): boolean {
        return false;
    }
    private textSearchNumField(): boolean {
        return false;
    }
    private numSearchTextField(): boolean {
        return false;
    }
    private logicFieldMustBeNum(): boolean {
        return false;
    }
    /*Helpers to make these tasks easier
    1. Compile list of all terms (Ignoring nesting) formats as fieldName - value BOTH WHERE AND OPTIONS
    2. Compile list of all terms bearing in mind nesting - WHERE
    3. Compile list of all terms bearing in mind nesting - OPTIONS
    3. Compile Options Columns list
    4. Compile Options Order By list
    5. Compile Options
    SHOULD I CREATE OBJECTS TO EASE THIS PROCESS
    - DESIRABLE
    BODY OBJ 1-> (8) FILTER OBJ -> WHERE -> LOGICOPERATORS|OPERATORS|
     */
}
