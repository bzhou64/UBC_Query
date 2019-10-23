export default class Sorting {
    /*
    Sort works as Order Key or List of Order Keys
    Bear in Mind
        1. Sort considers the new "columns" made in Transformation
        2. Sort accepts an array or a single item of keys
     */
    private sorting: any;
    private rds: any[];

    constructor(rd: any [], sort: any) {
        this.rds = rd;
        this.sorting = sort;
    }

    public applySort(): any[] {
        let records: any[];
        return records;
    }

    public isSortValid?(listofdata: string[]): boolean {
        return false;
    }
}
