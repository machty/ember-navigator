import { route, state, createMap } from 'ember-constraint-router/-dsl';

export default createMap(() => [
  route('demo', () => [
    state('current-user', (user) => [
      user.match('absent', () => [
        route('login'),
      ]),

      user.match('present', () => [
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
      ]),
    ]),
  ]),
]);
