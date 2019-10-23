export default class Apply {
    /*
    EBNF rules: APPLY: [' (APPLYRULE (', ' APPLYRULE )* )? ']
    TODO
        Test for an array
        Test for ApplyRule fields
    WILL ACCEPT A GROUPING DATASET, THE APPLY RULE(S) and custom names
     */
    private ruleNames: string[];
    private rules: any[]; // Consider doing these two fields as pairs
    private groupDS: any[];

    constructor(groupeddataset: any[], apply: any[]) {
        /*
        Goal:
        Store the grouped dataset from 'Group'
        Store apply rules and names as is
         */
    }
    /*
    Assuming that the Apply Rules are legitimate
    (handle semantics in the other method, Transformation will handle when it's not)
    Feel free to add helpers to this
     */

    public setApply(): any[] {
        let records: any[];
        return records;
    }

    /*
    returns true IFF Apply semantics are all valid
    will accept a list of columns - feel free to add more params at this stage
     */
    public isApplyValid?(listofdata: string[]): boolean {
        return false;
    }


}
