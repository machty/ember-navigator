import { createMap } from 'ember-constraint-router/-dsl';

export default createMap(function() {
  this.route('demo', function() {
    let user = this.state('current-user');

    this.match(user, 'absent', function() {
      this.route('login');
    });

    this.match(user, 'present', function() {
      let ride = this.state('current-ride');

      this.match(ride, 'notRiding', function() {
        this.route('request-ride');
      });

      this.match(ride, 'riding', function() {
        this.route('riding');
        this.route('request-music');
      });

      this.match(ride, 'complete', function() {
        this.route('ride-complete');
      });

      this.route('user-settings');
    });
  });
});