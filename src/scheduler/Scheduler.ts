import {IScheduler, SchedRoom, SchedSection, TimeSlot} from "./IScheduler";
import Sorting from "../controller/Sorting";

export default class Scheduler implements IScheduler {

    public schedule(sections: SchedSection[], rooms: SchedRoom[]): Array<[SchedRoom, SchedSection, TimeSlot]> {
        // TODO Implement this
        // Idea 1: Let sections be organized by largest Room Requirements, rooms organized by largest space
        // - You should select the room with the largest space, and if that is
        // - unavailable reshuffle the remaining rooms to sort
        // - distance away then use the next closest room. If that room has insufficient space, scroll to the next room.
        // - 0.7 means priority on enrollment, less on space so it should work
        // TODO: Object that takes in the sections, and returns an object with total enrol in section
        // TODO: Object that takes in the rooms and the room of focus, and returns an array object
        // TODO: with harvestine distance
        // TODO: Use Sorting Fields
        let slots: TimeSlot[] = ["MWF 0800-0900", "MWF 0900-1000", "MWF 1000-1100",
        "MWF 1100-1200", "MWF 1200-1300", "MWF 1300-1400",
        "MWF 1400-1500", "MWF 1500-1600", "MWF 1600-1700",
        "TR  0800-0930", "TR  0930-1100", "TR  1100-1230",
        "TR  1230-1400", "TR  1400-1530", "TR  1530-1700"];
        let sortinRoom: Sorting = new Sorting(rooms, {dir: "down", keys: ["rooms_seats"]});
        let sects: any[] = this.addEnrollmentSize(sections);
        let sortinSec: Sorting = new Sorting(sects, {dir: "up", keys: ["enrol_total"]});
        let orderedRoom: any[] = sortinRoom.applySort();
        let orderedSec: any[] = sortinSec.applySort();
        let results: any[] = [];
        for (let v of orderedRoom) {
            for (let s of slots) {
                let blank: any = [{}, v , s];
                results.push(blank);
            }
        }
        while (orderedSec.length !== 0 && orderedRoom.length !== 0) { // If these are 0, we have no more work to do
            let seck: any = orderedSec.pop();
            this.addingSectionToRooms(seck, orderedRoom, results);
        }
        let pruneResult: any[] = this.pruningResults(results);
        // This will remove any excess objects (room + slots with no class allocated at all).
        return pruneResult;
    }

    private addEnrollmentSize(section: SchedSection[]): any[] {
        let newCopy: any[] = [];
        for (let sec of section) {
            let sece: any = {};
            sece["courses_dept"] = sec.courses_dept;
            sece["courses_id"] = sec.courses_id;
            sece["courses_uuid"] = sec.courses_uuid;
            sece["courses_pass"]  = sec.courses_pass;
            sece["courses_fail"] = sec.courses_fail;
            sece["courses_audit"] = sec.courses_audit;
            sece["courses_avg"] = sec.courses_avg;
            sece["courses_instructor"] = sec.courses_instructor;
            sece["courses_title"] = sec.courses_title;
            sece["courses_year"] = sec.courses_year;
            sece["enrol_total"] = sec.courses_pass + sec.courses_fail + sec.courses_audit;
            newCopy.push(sece);
        }
        return newCopy;
    }

    private addHarvestineDistance(room: SchedRoom, rooms: SchedRoom[]): any[] {
        let newCopy: SchedRoom[] = [];
        for (let rooma of rooms) {
            let roomo: any = {};
            roomo["rooms_shortname"] = rooma.rooms_shortname;
            roomo["rooms_number"] = rooma.rooms_number;
            roomo["rooms_seats"] = rooma.rooms_seats;
            roomo["rooms_lat"] = rooma.rooms_lat;
            roomo["rooms_lon"] = rooma.rooms_lon;
            roomo["rooms_name"] = rooma.rooms_name;
            roomo["rooms_fullname"] = rooma.rooms_fullname;
            roomo["rooms_address"] = rooma.rooms_address;
            roomo["rooms_type"] = rooma.rooms_type;
            roomo["rooms_furniture"] = rooma.rooms_furniture;
            roomo["rooms_href"] = rooma.rooms_href;
            roomo["harv_dist"] = this.havdist(room, rooma);
        }
        return newCopy;
    }

    private havdist(room1: SchedRoom, room2: SchedRoom): number {
        let pi: number = Math.PI;
        let rd: number = 6371e3;
        let lt1: number = room1.rooms_lat * pi / 180;
        let lt2: number = room2.rooms_lat * pi / 180;
        let delLat: number =  (room2.rooms_lat - room1.rooms_lat) * pi / 180;
        let delLon: number = (room2.rooms_lon - room1.rooms_lon) * pi / 180;
        let a: number =  Math.sin(delLat / 2) * Math.sin(delLat / 2) +
            Math.cos(lt1) * Math.cos(lt2) * Math.sin(delLon / 2) * Math.sin(delLon / 2);
        let c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a) );
        let d: number = rd * c;
        return d;
    }

    private removeEnrollmentSize(section: any): SchedSection {
        let b: SchedSection = {
            courses_audit: section.courses_audit,
            courses_avg:  section.courses_avg,
            courses_dept: section.courses_dept,
            courses_fail: section.courses_fail,
            courses_id: section.courses_id,
            courses_instructor: section.courses_instructor,
            courses_pass: section.courses_pass,
            courses_title: section.courses_title,
            courses_uuid: section.courses_uuid,
            courses_year: section.courses_year
        };
        return b;
    }

    private removeHarvestingSize(rooms: any[]): SchedRoom[] {
        let voo: SchedRoom[] = [];
        for (let r of rooms) {
            let b: SchedRoom = {
                rooms_address: r.rooms_address,
                rooms_fullname: r.rooms_fullname,
                rooms_furniture: r.rooms_furniture,
                rooms_href: r.rooms_href,
                rooms_lat: r.rooms_lat,
                rooms_lon: r.rooms_lon,
                rooms_name: r.rooms_name,
                rooms_number: r.rooms_number,
                rooms_seats: r.rooms_seats,
                rooms_shortname: r.rooms_shortname,
                rooms_type: r.rooms_type
            };
            voo.push(b);
        }
        return voo;
    }

    private addingSectionToRooms(sec: any, orderedRoom: any[], results: any[]) {
        // Check if all slots are filled for the Room
        // if it is, reorder the remaining rooms by that room - DONE
        // else for each slot check for conflicts
        // if there are conflicts, go to next time period
        // else test if the class can fit
        // if it fits add it, else don't add
        let ordRom: any;
        if (orderedRoom.length === 0) {
            return;
        }
        while (orderedRoom.length !== 0) {
            if (this.checkAllSlotsAreFilled(orderedRoom[0], results)) {
                ordRom = orderedRoom.shift();
                orderedRoom = this.sortByHavestine(ordRom, orderedRoom);
            } else {
                ordRom = orderedRoom[0];
                break;
            }
        }
        if (orderedRoom.length === 0) {
            return;
        }
        for (let r of results) {
            if (r[1] === ordRom) { // an area with free space
                if (!this.thereAreConflictingSections(sec, results, r,  r[2])) {
                    this.tryInsertingSection(sec, r);
                    return; // This principle seeks to ensure that the class is choosing the best enrolment room
                }
            }
        }
    }

    private sortByHavestine(roomOne: any, roomsRemaining: any[]): SchedRoom[] {
        this.addHarvestineDistance(roomOne, roomsRemaining);
        let sorte: Sorting = new Sorting(roomsRemaining, {dir: "up", keys: ["harv_dist"]});
        let reordered: any[] = sorte.applySort();
        let reorder: SchedRoom[] = this.removeHarvestingSize(reordered);
        return reorder;
    }

    private checkAllSlotsAreFilled(desiredRoom: any, results: any[]): boolean {
        for (let e of results) {
            if (e[0] === {} && e[1] === desiredRoom) { // Check if each slot is filled for the class
                return false;
            }
        }
        return true;
    }

    private thereAreConflictingSections(sec: any, results: any[], r: any,  rTime: any): boolean {
        if (r[0] !== {}) { // The best class has already been added earlier
            return true;
        }
        for (let e of results) { // Check if that class (irrespective of section) is in other rooms at the same time
            if (e[2] === rTime) {
                if (sec.courses_id === e[0].courses_id && sec.courses_dept === e[0].courses_dept) { // same class
                   return true;
                }
            }
        }
        return false;
    }
    // The rationale behind only testing if it fits is that we already order the rooms by size, if it doesn't fit this
    // room in question, it obviously won't fit the subsequent (smaller) rooms
    // Also, since the classes are ordered by their size as well, any previous rooms already filled would have higher
    // enrollment.

    private tryInsertingSection(sec: any, r: any) {
        if (sec.enrol_total <= r[1].rooms_seats) { // if the section will fit, insert, else discard it.
            let newsec: SchedSection = this.removeEnrollmentSize(sec);
            r[0] = newsec;
        }
    }

    private pruningResults(result: any[]): any[] {
      let res: any[] = [];
      for (let r of result) {
          if (r[0] !== {}) {
              res.push(r);
          }
      }
      return res;
    }
}
