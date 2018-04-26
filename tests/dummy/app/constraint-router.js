import { createMap } from 'ember-constraint-router/-dsl';

export default createMap(function() {
  this.route('demo', function() {
    let auth = this.state('auth');

    this.match(auth, 'user-absent', function() {
      this.route('sign-in');
    });

    this.match(auth, 'current-user', function() {
      let ride = this.state('ride');

      this.match(ride, 'not-riding', function() {
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

    this.route('x-user', { path: 'users/:user_id' }, function () {
      this.route('x-posts', { path: 'posts' });
    });
  });
});