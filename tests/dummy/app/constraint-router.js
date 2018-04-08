import { route, state, when, createMap } from 'ember-constraint-router/-dsl';

export default createMap(() => [
  route('fun'),
  route('foo', () => [
    route('bar', () => [
      state('current-ride', (ride) => [
        ride.match('notRiding', () => [
          route('request-ride')
        ]),
        ride.match('riding', () => [
          route('riding')
        ]),
        ride.match('complete', () => [
          route('ride-complete')
        ]),
      ])
    ])
  ])
]);