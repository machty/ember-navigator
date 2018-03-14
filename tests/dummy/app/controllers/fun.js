import Ember from 'ember';
const RouteRecognizer = Ember.__loader.require('route-recognizer')['default'];


class Node {
  buildChildren(data) {
    // let { path } = handlerInfos[0];
    // let subHandlerInfos = customRouter.recognize(path);

    return {
      main: data.infos
    }
  }

  static foo() {
  }

}

class RootNode extends Node {
}

class LoggedInNode extends Node {
}

class LoggedOutNode extends Node {
}


export default Ember.Controller.extend({
  recognizer: Ember.computed(function() {
    let recognizer = new RouteRecognizer();

    router.add([
      { path: "/", handler: RootNode },
      { path: "/LoggedIn", handler: LoggedIn },
    ]);

    router.add([
      { path: "/", handler: RootNode },
      { path: "/LoggedOut", handler: LoggedOut },
    ]);

    recognizer.recognize(path);


  }),

  wat() {
    let infos = this.get('recognizer').recognize(path);

    for (let index = 0; index < infos.length; ++index) {
      let info = infos[index];
      let node = info.handler;
      let params = info.params;
      let res = node.buildChildren({
        infos,
        index,
      });


      {

      }


      // let { handler, params } = infos[i];

    }
  }
});
