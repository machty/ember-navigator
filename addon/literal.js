export default class Literal {
  constructor(value) {
    this._value = value;
  }

  value() {
    return this._value;
  }
}
