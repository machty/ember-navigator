import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import map from './constraint-router';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  map.mount(this);

  // this.route('fun');
  // this.route('foo', function() {
  //   this.route('bar', function() {
  //     // this.route('imastate', function() {
  //       this.route('baz');
  //     // });
  //   });
  // });
});

export default Router;
