export default class ValidationResult {
  constructor() {
    this.violations = [];
  }

  addViolation(constraint, violation) {
    this.violations.push(violation);
  }

  isValid() {
    return this.violations.length === 0;
  }
}
