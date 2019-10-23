export default class Columns {
    /*
    TODO:
        Add Columnar Functionality

    This Object Will Accept a Dataset and the Column Values
    And Should Output A Resulting Array with only selected columns specified
    - Al Did This Implementation in Sprint 1 but an important caveat
        Apply rules are also applicable as column names now
        If Apply rules are used
     */
    private rds: any[];
    private columndesired: string[];
    constructor(dataset: any[], columns: string[]) {
        this.rds = dataset;
        this.columndesired = columns;
    }

    public applyColumns(): any[] {
        let records: any[];
        return records;
    }

    public isColumnarValid?(listofdata: string[]): boolean {
        return false;
    }
}
