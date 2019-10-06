// Assumes that the section is valid
export default class Section {
    public dept: string;
    public id: string;
    public avg: number;
    public instructor: string;
    public title: string;
    public pass: number;
    public fail: number;
    public audit: number;
    public uuid: string;
    public year: number;
    public mfield: {[index: string]: number};
    public sfield: {[index: string]: string};

    constructor(dept: string, id: string, avg: number, instructor: string,
                title: string, pass: number, fail: number, audit: number, uuid: string, year: number) {
        this.dept = dept;
        this.id = id;
        this.avg = avg;
        this.instructor = instructor;
        this.title = title;
        this.pass = pass;
        this.fail = fail;
        this.audit = audit;
        this.uuid = uuid;
        this.year = year;

        this.sfield["dept"] = dept;
        this.sfield["id"] = id;
        this.sfield["instructor"] = instructor;
        this.sfield["title"] = title;
        this.sfield["uuid"] = uuid;
        this.mfield["avg"] = avg;
        this.mfield["pass"] = pass;
        this.mfield["fail"] = fail;
        this.mfield["audit"] = audit;
        this.mfield["year"] = year;
    }
}
