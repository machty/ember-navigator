import Violation from 'ember-constraint-router/violation';

export default class AndConstraint {
  constructor(operands) {
    this.operands = operands;
  }

  validate(payload, result) {
    let foundTrue = false;
    for (let i = 0; i < this.operands.length; ++i) {
      let value = this.operands[i].value(payload);
      if (value) {
        foundTrue = true;
        break;
      }
    }

    if (!foundTrue) {
      result.addViolation(new Violation(this));
    }
  }
}
