import Section from "./Section";

export default class DataSet {
    public sections: {[index: string]: Section};
    public id: string;

    constructor(id: string) {
        this.id = id;
        this.sections = {};
    }
    public addSection(section: Section) {
        this.sections[section.uuid] = section;
    }

}
