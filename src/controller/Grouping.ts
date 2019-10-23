export default class Grouping {
    private rsfData: any[];
    private criteria: string;
    private groups: Grouping[];
    private criteriaRemaining: string[];
    private mutableObject: any;

    /*
        Constructor Accepts:
            1. Result So Far Dataset Array - Limited to this particular scope
            2. Criteria We Are NOW GOING TO REFLECT
            3. The Value of the Last Criteria Principle. If This is the First Iteration, It Will Be Undefined
            4. Remaining Criteria We Will Still Need To Reflect
            5. Object With Updated Criteria - This Should Be Updated as It Moves Down The Chain starts out as {}

     */
    constructor(rsf: any[], criteria: string, criteriaRemaining: string[], mutableObj: any) {
        /*
        Implementation FAQ
        Base Case - String criteria is NULL, |criteriaRemaining| == 0
                    add [result: rsf] to  mutableObj
        Otherwise - String criteria is active, |criteriaRemaining| == 0
                    find unique values of criteria (SET)
                    for each value derived
                        build rsf of these values
                        groups.push(new Grouping(related_rsf, NULL, criteriaRemaining, nMO))
        Otherwise - String criteria is active, |criteriaRemaining| > 0
                    find unique values of criteria (SET)
                    for each value derived
                        build rsf of these values
                        groups.push(new Grouping(related_rsf, criteriaRemaining[0], criteriaRemaining[less 0], nMO))
                        */
        /*
        4. WISH LIST!: Helpers to build to make this simpler (and avoid ESLint Bullshit)
            - GroupHelper.related_rsf(criteria: string, value: any, rsf) will
                return an rsf with only items that satisfy criteria==value
            - GroupHelper.nextCriteria(criteriaRemaining: string[]) will return criteriaRemaining[0]
            - GroupHelper.newRemainingCriteria(criteriaRemaining: string[]) will return criteriaRemaining[less 0]
            - GroupHelper.newMutableObject(oldMutableObj: any, newField: string, newValue: any)
            will take the old object and add newField
*/
        /*
         If done correctly,
            1. The mutable object in the base (where criteria is null) will contain
                    a) Each criteria and their respective value (representing the group)
                    b) results which will contain a full array of all records corresponding to the criteria
            2. The resulting collection will be easily parsed in output
            3. Empty combo sets will be ignored reducing the workload from brute force to simple combinations
         */
    }

    /*
    Once the hierarchy is set, showGroups will output the mutable objects of each base case
    This would be the final groupings with all criteria if done correctly
    Requires: nothing
    Effects: returns the grouped list of records
     */

    public showGroups(): any[] {
        if (this.criteria === undefined) {
            return this.mutableObject;
        } else {
            let record: any;
            return record;
        }
        let records: any;
        return records;
    }


}
