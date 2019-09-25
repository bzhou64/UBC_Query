import Section from "./Section";

export default class DataSet {
    private sections: {[index: string]: Section};
    public id: string;

    constructor(id: string) {
        this.id = id;
    }
    public addSection(section: Section) {
        this.sections[section.dept + "_" + section.id + "_" + section.section] = section;
    }

}
