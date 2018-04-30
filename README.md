# ember-constraint-router

**Note: Very Very Alpha**

This repo houses various Ember routing experiments that fall under the
umbrella of "constraint routing", i.e. the ability to "route" or navigate
by more things than just the URL (this is expecially useful for WebSocket-driven
mobile apps like Uber/Lyft). This repo also includes experiments with mobile
navigation stacks (like iOS's UINavigationController) that might be extracted
into a separate library at a later date once the primitives settle.

Relevant links for the background/ground motivation for this:

- [ember-constraint-router demo](https://www.youtube.com/watch?v=RwdKn-EfzgE)
- [EmberNYC meetup haphazard lightning talk](https://youtu.be/dhfTPJJXuJ4?t=444)
- [ember-rideshare](https://www.dunningpostor.com/ember-rideshare/)

This is totally not ready for public consumption and currently relies on a
[fork](https://github.com/machty/ember.js/tree/dynamic-scope)
of Ember 3.1 (which consists of literally a
[single line of code change](https://github.com/machty/ember.js/commit/d7d903acdfda7f36600a9c2db0437b21e09cbef3));
I'm currently testing out a lot of these patterns on FutureProofRetail.com apps and if all
goes well hopefully we can land an RFC or two to enable officially-sanctioned addon
experimentation with "scoped services" and other dynamic scope use cases.

If you're interesting to get involved or talk about this stuff, hit up the
`#router-ideas` channel in the Ember Community Slack.

## Installation

* `git clone <repository-url>` this repository
* `cd ember-constraint-router`
* `yarn install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `yarn test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
