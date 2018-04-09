import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import map from './constraint-router';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  map.mount(this);
});

export default Router;
