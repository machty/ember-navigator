# ember-navigator <img src="https://raw.githubusercontent.com/machty/ember-navigator/master/tests/dummy/public/ember-navigator-mark.svg" width=36 height=36 />

A routing/navigation library for Ember.js suitable for mobile app UI flows, modeled after
[React Navigation](https://reactnavigation.org/) and a few other mobile-centric navigation
libraries that have popped up over the years.

## Status: Beta

Ember Navigator is beta, under-documented, but used in production
[FutureProof Retail](https://github.com/futureproofRetail/)
and [Yapp](https://github.com/yappbox) applications (and others) since 2020.

## Motivation

Ember.js's Router is robust and battle-tested, but is not well-suited to common UI flows for mobile
applications. For instance, it is a common mobile UI pattern to offer a tab bar of navigation buttons
for different sections of the app, and for each section of the app to maintain/remember/restore
its internal navigation state (which may be stack-based) when navigating between the tabs. This would
be very difficult to model in the Ember.js Router, but is much easier with the primitives that
Ember Navigator provides.

## Installation

`ember install ember-navigator`

## Concepts

- [Router "map"](#router-map)
- [Router State](#router-state)
- [Actions](#actions)
- ["Mounting"](#-mounting-)
- [Routes](#routes)
- [URLs and ember-navigator](#urls-and-ember-navigator)

### Router "map"

The router map should seem familiar from ember's router, with some differences. Here's an example of what the router
map might looks like for an app similar to Twitter:

```js
import {
  mount,
  route,
  stackRouter,
  tabRouter
} from 'ember-navigator';

this.mountedRouter = mount(
  tabRouter('tabs', [
    stackRouter('timelineTab', [
      route('timeline'),
      route('tweet'),
      route('profile'),
      route('photos'),
      route('video'),
      // etc...
    ]),
    stackRouter('searchTab', [
      route('trends'),
      tabRouter('searchResultsTabs', [
        stackRouter('topTab', [
          route('tweet'),
          route('profile'),
          // etc...
        ]),
        stackRouter('latestTab', [
          route('timeline'),
          route('tweet'),
          // etc...
        ]),
          // etc...
      ]),
      route('group'),
      route('members'),
      // etc...
    ]),
    stackRouter('notificationsTab', [
      route('notifications'),
      route('tweet'),
      route('profile'),
      // etc...
    ]),
    stackRouter('messagesTab', [
      route('inbox'),
      route('thread'),
      route('tweet'),
      // etc...
    ]),
  ])
);
```

You can see from the above example that different types of routers can have different logic about how they handle
navigation and rendering.

* A `TabRouter` has only one of its children rendered at a time, but remembers the state of each tab as the user switches between them.
* A `StackRouter` starts off with the first declared child route as its only item and will push additional items onto its stack as the user drills down and pops items off the stack as the user taps back, for example. Only the top-most item of the stack is rendered.  
* A `SwitchRouter` (not shown in this example) has only one of its children rendered at a time, and resets the state of each child when switching between them.

Besides these three Router implementations that are included in ember-navigator, you can write your own router classes too, either by subclassing one of these three, or subclassing the router base class that ember-navigator provides.

One thing to note in the above example is that some routes are shown under more than one stackRoute. For example a profile screen in Twitter is available from many different contexts. You could even navigate to a profile screen and then another profile screen of another user on the same stack. This is an example of a feature of ember-navigator which is very difficult to achieve using the Ember router.

[You may ask yourself][1], "where do  I put this code?" There is not currently a prescriptive or opinionated answer to this question in ember-navigator. The mountedRouter property needs to be passed to a component for rendering eventually. You could do the router map definition and mounting in a service. The dummy app in this repository does it in the application controller.

### Router State

Like "outlet" state in vanilla Ember (or redux reducer state), this is a structure of plain old Javascript objects and arrays
that is built up by the various routers and passed to the various navigator components for rendering.

<details>
  <summary>Here is an annotated example of what a snapshot in time of router state might look like:</summary>

```js
{
  // The routeName corresponds to the name given in the router map
  "routeName": "tabs",
  // The `index` designates which child route is active -- in this case, it is the first tab
  "index": 0,
  // The key property should uniquely identify this route and it's content. Routers may use
  // this information for navigation purposes.
  "key": "TabRouter",
  // The component name that will be used to render this node of the router
  "componentName": "ecr-switch",
  // The children of this node, i.e. the various tabs, in order
  "routes": [
    {
      "key": "timelineTab",
      // The index at this level indicates that the second item of this stack route is active
      "index": 1,
      // The children of this node, i.e. the items in this stack
      "routes": [
        {
          // Params are used by the route and component to fetch & render the appropriate content
          "params": {
            "timeline_id": "bf98e08e-d286-46c7-9faa-780e8ff69ce9"
          },
          // Corresponds to the string provided in the router map
          "routeName": "timeline",
          "key": "timeline:bf98e08e-d286-46c7-9faa-780e8ff69ce9",
          "componentName": "timeline"
        },
        // This is the active tab, so the item below represents the active route that should
        // currently be rendered to the screen. i.e. the user is looking at a tweet
        {
          "params": {
            "tweet_id": "f2ee81ef-3291-4397-877e-2a27a50a19bc"
          },
          "routeName": "tweet",
          "key": "tweet:f2ee81ef-3291-4397-877e-2a27a50a19bc",
          "componentName": "tweet"
        }
      ],
      "componentName": "ecr-stack",
      "params": {},
      "routeName": "timelineTab"
    },
    {
      "key": "searchTab",
      "index": 0,
      "routes": [
        {
          "params": {},
          "routeName": "trends",
          "key": "trends",
          "componentName": "trends"
        }
      ],
      "componentName": "ecr-stack",
      "params": {},
      "routeName": "searchTab",
    },
    {
      "key": "notificationsTab",
      "index": 0,
      "routes": [
        {
          "params": {},
          "routeName": "notifications",
          "key": "notifications",
          "componentName": "notifications"
        }
      ],
      "componentName": "ecr-stack",
      "params": {},
      "routeName": "notificationsTab",
    },
    // Note that while the messages tab is not currently active and therefor is not rendered to
    // to the screen, it has two children (inbox > thread). When the user does switch to this
    // tab, she will be looking at the thread,
    {
      "key": "messagesTab",
      "index": 1,
      "routes": [
        {
          "params": {},
          "routeName": "inbox",
          "key": "inbox",
          "componentName": "inbox"
        },
        {
          "params": {
            "thread_id": "31b489e4-9e91-43bc-a7dc-0060dd8434b1"
          },
          "routeName": "thread",
          "key": "thread:31b489e4-9e91-43bc-a7dc-0060dd8434b1",
          "componentName": "thread"
        }
      ],
      "componentName": "ecr-stack",
      "params": {},
      "routeName": "messagesTab"
    }
  ]
}
```
</details>


### Actions

Actions like `navigate` and `pop` are delegated to the active routers and result in changes to the router state, which in turn
results in re-rendering.

Given the map example earlier in this README, the following call to `navigate` would push a new profile screen onto the current active stack. If the profile already exists in the active stack, it would instead pop items off to return to the profile.

```js
this.mountedRouter.navigate({
  routeName: 'profile',
  params: { profile_id: '42' },
  key: 'profile:42'
});
```

This call to `pop` would remove the top item of the stack and make the item underneath it active.

```js
this.mountedRouter.pop();
```

The behavior described in response to `navigate` and `pop` is dependent on the *Router implementations, which are able to handle abstract actions and respond with updated state if they elect to handle the action.

There are a number of action types defined in the ember-navigator codebase, but the built-in routers handle only a small subset of them.

### "Mounting"

The process of instantiating the router map into an active router is done by passing the definition to "mount" and the result is
an instance of the `MountedRouter` class. It in turn has a tree of `MountedNode` instances. A MountedNode is the "internal"
stateful node that the routing API doesn't have access to.

### Routes

The `MountedRouter` resolves route definitions to `NavigatorRoute` instances. This is a public API that has a reference to the underlying
`MountedNode`. The `NavigatorRoute` instance is provided to the rendered component. ember-navigator provides a `NavigatorRoute` base class
to extend your classes from. These `NavigatorRoute` instances are instantiated via the Ember container under the type `navigator-route`.
So a "tweet" route would be resolved via the container as `navigator-route:tweet`, which Ember would look for, by default, in
`app/navigator-routes/tweet.js`. If a named NavigatorRoute is not found, it will look up `navigator-route:basic`. ember-navgiator
exports NavigatorRoute to this location, but you are encouraged to override it with your own implementation by creating a file at
`app/navigator-routes/basic.js` in your app.

### URLs and ember-navigator

There is no built-in support for URLs with ember-navigator. The arbitrary depth and items of stacks and the unrendered state of
tabs makes URLs a complex challenge with a variety of viable solutions from a product and UX perspective.  As a technical matter,
it is possible to achieve deep linking and serialization of URLs by integrating ember-navigator with a wildcard route of the
Ember router or with the location service directly. This is not a minor undertaking, though.

## Running the example app

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `yarn test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

[1]: https://youtu.be/5IsSpAOD6K8?t=48
