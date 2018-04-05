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
        when({ other: 123 }, [
          route('comments')
        ]),
      ]),
      state('my-service')
    ]),
    route('bar'),
  ]);

  let result;
  result = map.recognize('foo/foochild');
  assert.deepEqual(mapResult(result), ['foo', 'foochild']);
  result = map.recognize('bar');
  assert.deepEqual(mapResult(result), ['bar']);
  result = map.recognize('foo/posts');
  assert.deepEqual(mapResult(result), ['foo', 'admin', 'posts']);
  result = map.recognize('foo/comments');
  assert.deepEqual(mapResult(result), ['foo', 'admin', 'when', 'comments']);

  result = map.recognizeAll('foo/comments');
});

function mapResult(result) {
  return result.map((obj) => obj.handler.name)
}