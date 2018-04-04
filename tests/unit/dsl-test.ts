import { test, module } from 'ember-qunit';
import { route, state, when, createMap } from 'ember-constraint-router/-dsl';

module('Unit - DSL test', {
  beforeEach: function () {
  },
  afterEach: function () {
  },
});

test('router map', function (assert) {
  assert.expect(4);

  let map = createMap([
    route('foo', [
      route('foochild'),
      state('admin', (adminState) => [
        route('posts'),
        when({ foo: 123 }, [
          route('comments')
        ]),
      ]),
    ]),
    route('bar'),
  ]);

  let result;
  result = map.recognize('foo/foochild');
  assert.deepEqual(result.map(({ handler }) => handler), ['foo', 'foochild']);
  result = map.recognize('bar');
  assert.deepEqual(result.map(({ handler }) => handler), ['bar']);
  result = map.recognize('foo/posts');
  assert.deepEqual(result.map(({ handler }) => handler), ['foo', 'posts']);
  result = map.recognize('foo/comments');
  assert.deepEqual(result.map(({ handler }) => handler), ['foo', 'comments']);
});