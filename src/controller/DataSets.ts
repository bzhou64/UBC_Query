import Dataset from "./DataSet";
import Log from "../Util";
export default class DataSets {
    public datasets: {[index: string]: Dataset} = {};
    constructor() {
        Log.trace("DataSets::init()");
    }
    public addDataset(dataset: Dataset) {
        this.datasets[dataset.id] = dataset;
    }
}
