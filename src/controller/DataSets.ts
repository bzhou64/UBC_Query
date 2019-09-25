import Dataset from "./DataSet";
export default class DataSets {
    private datasets: {[index: string]: Dataset};
    public id: string;

    constructor(id: string) {
        this.id = id;
    }
    public addDataset(dataset: Dataset) {
        this.datasets[dataset.id] = dataset;
    }
}
