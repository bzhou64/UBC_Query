import Section from "./Section";
import DataSet from "./DataSet";
function createValidSection(section: any) {
    if (section.Subject !== undefined && section.Course !== undefined &&
        section.Avg !== undefined && section.Professor !== undefined && section.Title !== undefined
        && section.Pass !== undefined && section.Fail !== undefined && section.Audit !== undefined
        && section.id !== undefined  && section.Year !== undefined) {
        let year = 1900;
        if (section.Year === "overall") {
            year = 1900;
        } else {
            year = parseInt(section.Year, 10);
        }
        let sectionObject: Section = new Section(section.Subject.toString(),
            section.Course.toString(), parseFloat(section.Avg),
            section.Professor.toString(), section.Title.toString(), parseInt(section.Pass, 10),
            parseInt(section.Fail, 10), parseInt(section.Audit, 10), section.id.toString(),
            year);
        return sectionObject;
    }
    return null;
}

export function addSectionsDataset(filesJSON: any, currDataset: DataSet) {
    filesJSON.forEach((fileJSON: any) => {
        if (fileJSON != null) {
            for (let section of fileJSON["result"]) {
                // totalSec++;
                let sectionObj: Section = createValidSection(section);
                // Log.trace(sectionObj);
                if (sectionObj) {
                    // validSec++;
                    currDataset.addRecord(sectionObj);
                }
            }
        }
    });
}

export function isIDValid(id: string): boolean {
    return !(id === undefined ||  id === null ||
        id.includes("_") || id === "" || !id.replace(/\s/g, "").length);
}

export function findTag(parent: any, arrayTables: any[], tag: string) {
    if (parent.nodeName === tag) {
        arrayTables.push(parent);
    } else {
        if (parent.hasOwnProperty("childNodes")) {
            parent.childNodes.forEach((child: any) => {
                this.findTag(child, arrayTables, tag);
            });
        }
    }
}
