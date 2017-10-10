import Violation from 'ember-constraint-router/violation';

export default class EqualityConstraint {
  constructor(operands) {
    this.operands = operands;
  }

  validate(payload, result) {
    if (this.operands.length < 2) {
      return;
    }

    let firstValue = this.operands[0].value(payload);
    for (let i = 1; i < this.operands.length; ++i) {
      let value = this.operands[i].value(payload);
      if (value !== firstValue) {
        result.addViolation(new Violation(this));
      }
    }
  }
}
