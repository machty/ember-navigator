import Ember from 'ember';
const RouteRecognizer = Ember.__loader.require('route-recognizer')['default'];


/*
const c = Factory;


class RootNode extends Node {
  render() {
    return this.
  }
}

class LoggedInNode extends Node {
}

class LoggedOutNode extends Node {
}







*/



export default Ember.Controller.extend({
  recognizer: Ember.computed(function() {
    let recognizer = new RouteRecognizer();

    router.add([
      { path: "/", handler: RootNode },
      { path: "/LoggedIn", handler: LoggedInNode },
    ]);


    router.add([
      { path: "/", handler: RootNode },
      { path: "/LoggedOut", handler: LoggedOutNode },
    ]);

    recognizer.recognize(path);
  }),

  wat() {
    let infos = this.get('recognizer').recognize(path);
    let rootNodeClass = infos[0].handler;
    rootNodeClass.build({
      infos
    });
  }
});
