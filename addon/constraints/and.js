import Violation from 'ember-constraint-router/violation';

export default class AndConstraint {
  constructor(operands) {
    this.operands = operands;
  }

  validate(payload, result) {
    // TODO: we almost certainly need to distinguish between
    // path-failure UNDEFINEDs and other undefineds; in other words,
    // and([ref('foo'), ref('bar')]) on a context obj of `{}` 
    for (let i = 0; i < this.operands.length; ++i) {
      let value = this.operands[i].value(payload);
      if (!value) {
        result.addViolation(new Violation(this));
      }
    }
  }
}
