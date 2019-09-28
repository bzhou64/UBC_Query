/*
This is the query class that will contain methods which will
1. parse JSON queries
2. build the hierarchy
3. output JSON result
4. error handling (nice to have)
- Should be used in InsightFacade.performQuery()
 */

export default class Query {
    private queryObj: any;
    constructor(query: any) {
        /* Should we include error handling here - if syntactically incorrect JSON
           Maybe just catch any error thrown
        */
        this.queryObj = JSON.parse(query);
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
