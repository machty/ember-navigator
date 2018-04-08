import Ember from 'ember';

export default Ember.Service.extend({
  foo: 123,

  validateConstraint(condition) {
    switch(condition) {
      case 'absent':
        return false;
        break;
      case 'present':
        return true;
        break;
    }
  }
});