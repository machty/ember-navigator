import { route, state, when, createMap } from 'ember-constraint-router/-dsl';

export default createMap(() => [
  route('fun'),
  route('foo', () => [
    route('bar', () => [
      state('current-ride', (ride) => [
        ride.match('absent', () => [
          route('riding')
        ]),
        ride.match('present', () => [
          route('not-riding')
        ]),
      ])
    ])
  ])
]);