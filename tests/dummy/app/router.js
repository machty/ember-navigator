import EmberRouter from '@ember/routing/router';

import config from './config/environment';

class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

export default Router;
