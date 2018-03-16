
Is it possible to use static compilation for route recognizer? Yes, but challenges:

- router.map would have to be statically analyzable
- route recognizer would have to be type script aware
- at the time of static analysis, all the interfaces would have to be specified

```
import { codeTemplate } from 'glimmer';

class Node {
  // This doesn't make sense. Model is stupid.
  // You MAYBE want temporarily added RIB
  model<T>(NodeArgs<T>) : someShit {
  },

  foo = 123,
  @tracked other = 999
  @codeTemplate children() {
    return ChildNode({ a: 123, infos: infos,  });
  }
}

class RootNode extends Node {
}



class UserNode extends Node {
  @inject @urlParam userId;



  buildChildren() {

  }
}

class PostsNode extends Node {
  // children can also inject URL params from their parent.
  // parents can provide params for their children???
  @inject @urlParam userId;


}

router.add([
  { path: "/", handler: IRootNode },
  { path: "/UserId/:userId", handler: IUserNode }
  { path: "/posts", handler: IPostsNode }
]);




import IRootNode from 'nodes/root';
import IUserNode from 'nodes/root';
import IPostsNode from 'nodes/root';

// these imports could be generated / assumed;
// stringly typed but statically analyzed.

router.add([
  { path: "/", handler: IRootNode },
  { path: "/UserId/:userId", handler: IUserNode }
  { path: "/posts", handler: IPostsNode }
]);








nodes.json

// TLDR youre "map" file generates stuff,
// modules that Provide injections, other things.
// If you change something 

// implicit root
export default {
  children: {
    main: {
      loggedIn: {
      },
      loggedOut: {
        loggedOut: {
        },
      },
    }
  }
};


```
import ChildNodeBuilder from 'builder:oh-shitch/child-node';

    buildChildren() {
      return {
        main: ChildNodeBuilder.build(
          state: wat(),
          props: wat(),
          di: di,
          di: EmptyDep(),

          // difference b/w di and props?
        )
      };
    }
```






// TODO:
assume no async, just get stuff working.



```
  // <A><B><C></C></B></A>
  // A.constructor
  // - this is created as part of the patch
  // A.render
  // B.constructor
  // B.render
  // C.constructor
  // C.render

  // then say we change A.state/props
  // A.render()
  // - returns <B> with same props {}. bprops.key is same, preserves component.
  // B.render()
  // - same, but let's pretend cProps is changed. We match on component type.
  // C.render()
```

The problem/challenge is it'd need to be end-to-end typescript.

```
  // tree.subscribe('root.wat', { eager: true })
  tree.changes('root.wat', { eager: true }).subscribe(() => {
  });
```

Random abstract idea that i think is ok:

Child, while it is "subscribed" to, while the tree is alive, can
subscribe to something. You could put something on the DI graph from root,
a subscribable/observable. Ultimately, your screen is a top level matrix of
pixels that "subscribes" to this nested-then-flattened tree. And there's
no issue with that. Parameterizing the tree is no different then what
the browser needs to do to recursively paint the DOM. It's a data structure,
it gets queried. Changes to inner nodes cause global repaints.


```
<Root>
  <Parent>
    <Child></Child>
  </Parent>
</Root>






so everything's a god damn vdom factory.


return ChildNodeBuilder




import WebService from 'my-app/services/web-service';
import { provides } from 'ember-di';

class ChildNode {
  @provides
  webService(hostUrl : URL) {
    return new WebService();
  }
}
```










## ember-later






```
import { later } from 'ember-later';
import { task } from 'ember-concurrency';

export default Component.extend({
  task(function * () {
    while(true) {
      doStuff();

      // timer loop that forever pauses tests
      yield timeout(5000, 'timer-tag');
    }
  }),
});









// in ember-concurrency

import { later } from 'ember-test-timers';


let 


export function timeout(ms, testLabel) {
  let timerId;
  let promise = new Promise(r => {
    timerId = later(r, ms, testLabel);
  });
  promise.__ec_cancel__ = () => {
    // remove from internal hash
    cancel(timerId);
  };
  return promise;
}








// in ember-test-timers

export function later(callback, ms, testLabel) {
  if (Ember.testing) {

  } else {
    Ember.run.later(callback, ms);
  }
}









timerLoop: task(function * () {
  while(true) {
    this.incrementProperty('lol');
    yield timeout(5000, 'test-timer-tag');

    // once you opt into tagging a timer, you
    // risk breaking other tests that expect it to run
    // to completion. maybe the logic should be:
    // execute first one 

  }
}).on('init')




import { fetchTimers, setTimerBehavior } from 'ember-concurrency/testing';

setTimerBehavior(() => {
});

test('something', async function() {
  let timer = timeout(5000, 'test-tag'):

  while(true) {
    yield timer;
  }

  await visit('/route-w-test-timer-tag');

  // normally this would block forever due to timer loop,
  // but since a test tag ("test-timer-tag") is specified, this timer
  // doesn't resume the task (and doesn't block test settling)
  // unless explicitly queried/resumed in the test
});

```


## Difference between node and all other run of the mill objects?


Answer: probably not a lot.








```
import HasUserSessionNode from 'nodes/has-user-session';
import GetUserSessionNode from 'nodes/get-user-session';

class RootNode extends Node {
  @build
  childNode(userSession : UserSession) {
    if (userSession) {
      return new HasUserSessionNode();
    } else {
      return new GetUserSessionNode();
    }
  }

  userSession: UserSession;
}









class LoggedInNode extends Node {
  @build
  childNodes(parent : Dependency) {
  }

  wsUrl: String;

  @build
  loginService(wsUrl: String) {
  }
}
```



## childNode vs childNodes

```
  @build
  childNodes(userSession : UserSession) {
    let wat = {};

    if (thing) {
      wat.borf = new SomeNode();
    }

    if (thing2) {
      wat.borf = new SomeNode2();
    }

    if (thing3) {
      wat.borf = new SomeNode3();
    }

    return wat;
  }
```


## Gameplan

- [ ] get sync navigation working
- [ ] get observables working as a method of subscribing to changes
- [ ] explore typescript












{root: {…}}
root
:
children
:
main
:
children
:
__proto__
:
Object
instance
:
ChildNode {props: {…}}
__proto__
:
Object
__proto__
:
Object
instance
:
RootNode
props
:
{}
__proto__
:
Node
__proto__
:
Object
__proto__
:
Object


















