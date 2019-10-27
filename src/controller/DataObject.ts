import Section from "./Section";
import Room from "./Room";
import {InsightError} from "./IInsightFacade";

export default class DataObject {

    // Helper Object That will Take a List of Sections/Rooms and outputs the desired JSON format
    public convertToJSON(ud: any[]): any[] {
        let records: any[] = [];
        for (let udr of ud) {
            if (udr instanceof Section) {
                records.push(this.selectColumnsAsObj(udr, "courses"));
            } else if (udr instanceof Room) {
                records.push(this.selectColumnsAsObj(udr, "rooms"));
            } else {
                throw new InsightError("Invalid Type");
            }
        }
        return records;
    }


    private selectColumnsAsObj(udr: any, type: string): any {
        let newData: any = {};
        Object.keys(udr).forEach((col) => {
            let colLong = type + "_" + col;
            newData[colLong] = udr[col];
        });
        return newData;
    }
}
