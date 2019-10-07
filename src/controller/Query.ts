/*
This is the query class that will contain methods which will
1. parse JSON queries
2. build the hierarchy
3. output JSON result
4. error handling (nice to have)
- Should be used in InsightFacade.performQuery()
 */

import {InsightError, ResultTooLargeError} from "./IInsightFacade";
import DataSets from "./DataSets";
import Filter from "./Filter";
import LogicComparison from "./LogicComparison";
import SComparison from "./SComparison";
import MComparison from "./MComparison";
import Negation from "./Negation";
import DataSet from "./DataSet";
import Options from "./Options";
import Log from "../Util";

export default class Query {
    private queryObj: any;
    private datasets: DataSets;
    private filter: Filter;
    private datasetId: string;
    private dataset: DataSet;
    public result: any = [];
    constructor(query: any, datasets: DataSets) {
        /* Should we include error handling here - if syntactically incorrect JSON
           Maybe just catch any error thrown
        */
        // DONE
        this.queryObj = query;
        this.datasets = datasets;
        let options = this.queryObj["OPTIONS"];
        if (options === undefined) {
            throw (new InsightError("OPTIONS clause missing in query"));
        }
        if (Object.keys(options).length !== 2) {
            throw (new InsightError("Too many or too few OPTIONS"));
        }
        let columns = options["COLUMNS"];
        if (columns === undefined || !Array.isArray(columns) || columns.length === 0) {
            throw (new InsightError("Columns missing from options or not an array"));
        }
        let order = options["ORDER"];
        if (order !== undefined && typeof(order) !== "string") {
            throw (new InsightError("Order missing from options"));
        }
        if (columns.length === 0) {
            throw (new InsightError("No column specified in options"));
        }
        let columnsOrder = columns.slice();
        columnsOrder.push(order);
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
            this.filter = new LogicComparison ("AND", where[whereOpt]);
        } else if (whereOpt === "OR") {
            this.filter = new LogicComparison ("OR", where[whereOpt]);
        } else if (whereOpt === "IS") {
            this.filter = new SComparison ("IS", where[whereOpt]);
        } else if (whereOpt === "LT") {
            this.filter = new MComparison ("LT", where[whereOpt]);
        } else if (whereOpt === "GT") {
            this.filter = new MComparison ("GT", where[whereOpt]);
        } else if (whereOpt === "EQ") {
            this.filter = new MComparison ("EQ", where[whereOpt]);
        } else if (whereOpt === "NOT") {
            this.filter = new Negation ("NOT", where[whereOpt]);
        } else {
            throw new InsightError("Invalid WHERE field");
        }
        let optionsObj: Options = new Options(options, Object.keys(this.datasets.datasets), this.datasetId);
        try {
            let filteredDataset = this.filter.applyFilter(this.dataset, Object.values(this.dataset.sections));
            let resultsArray = optionsObj.applyColumnsAndOrder(filteredDataset);
            this.result = resultsArray;
        } catch (e) {
            throw e;
        }
    }
    private datasetIdOptions(columnsOrder: string[]): string {
        // INTUITION: size of set should be = 1 if they are all in the same dataset "courses_xxx"
        let colName = "";
        columnsOrder.forEach((col) => {
            let currName = col.split("_")[0];
            if (colName === "") {
                colName = currName;
            }
            if (colName !== "" && currName !== colName) {
                return null;
            }
        });
        return colName;
    }
}
