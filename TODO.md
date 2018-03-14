
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








// TODO:
assume no async, just get stuff working.





- [ ] hardwired backwards compat node line
  - [ ] 









```

The problem/challenge is it'd need to be end-to-end typescript.


