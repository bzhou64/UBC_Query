import Grouping from "./Grouping";

export default class Group {
    private groups: string[];
    private grouping: Grouping;
    private dataset: any;
    private obj: any;

    /*
    EBNF Rules GROUP: [' (key ',')* key ']
    TODO:
     GROUP Must Specify an Array - Error Check in Constructor
     GROUP Must Indicate at least one key
     */
    constructor(groupobj: any, rsfdataset: any) {
        // Throw any Errors in Grammar
    }

    /*
    Requires: Nothing - 'Grouping' Handles the Load in this problem
    Effects: Returns a valid list of groups where criteria is clearly defined for each group
    */
    /*
    IMPORTANT NOTES ON IMPLEMENTATION
    WLOG: apply grouping should return in the format*/
    /*
        [ {criteria 1: ?, criteria 2: ?, .... criteria k: ?, result: AnArrayOfRecords},
        {criteria 1: ?, criteria 2: ?, .... criteria k: ?, result: AnArrayOfRecords}...]
        for all possible unique matchings!
        */
    /*
    For the sake of optimization at runtime, we will end up ignoring criteria combos with 0 items
     */
    public applygrouping(): any[] {
        let groupe: any[];
        return groupe;
    }

    /*
    As in Transformations this tests the semantic validity, NOT the grammar
     */
    public isGroupValid?(existingColumnNames: string[]): boolean {
        return false;
    }
}
