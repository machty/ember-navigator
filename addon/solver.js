import ValidationResult from './validation-result';

export default class Solver {
  constructor() {
    this.constraints = [];
  }

  addConstraint(constraint) {
    this.constraints.push(constraint);
  }

  validate(payload) {
    let result = new ValidationResult();
    this.constraints.forEach(constraint => {
      constraint.validate(payload, result)
    });

    return result;
  }
}

