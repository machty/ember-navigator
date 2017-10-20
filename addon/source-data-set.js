export default class SourceDataSet {
  constructor(sourceDatas) {
    this.array = sourceDatas;
    this.map = {};
    // this.array.forEach(() =>)
  }
}

class ChangeEvent {
  constructor(sourceDataSet, lastDataSet) {
    this.sourceDataSet = sourceDataSet;
    this.lastDataSet = lastDataSet;
  }
}
 l
