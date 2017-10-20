import ValidationResult from './validation-result';

const EMPTY_ARRAY = [];

export default class Solver {
  constructor() {
    this.constraints = {};
  }

  addConstraint(sourceDataKey, constraint) {
    this.constraints[sourceDataKey] = this.constraints[sourceDataKey] || [];
    this.constraints[sourceDataKey].push(constraint);
  }

  validate(payload) {
    let result = new ValidationResult();

    this.constraints.forEach(constraint => {
      constraint.validate(payload, result)
    });

    return result;
  }

  solve(changeEvent) {
    let sourceDataSet = changeEvent.sourceDataSet;

    let result = new ValidationResult();
    sourceDataSet.array.forEach(sourceData => {
      let constraints = this.constraints[sourceData.key] || EMPTY_ARRAY;
      constraints.forEach(constraint => {
        constraint.validate(sourceData, result);
      });
    });

    if (result.isValid()) {
      return;
    }

    // We have a failed validation, now we need to figure out how to solve.

    // Loop through all failed constraints;
    // So we have multiple data sets.
    // Some might have constraint failures.

  }
}

