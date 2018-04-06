import { test, module } from 'ember-qunit';
import { route, state, when, createMap } from 'ember-constraint-router/-dsl';

module('Unit - DSL test', {
  beforeEach: function () {
  },
  afterEach: function () {
  },
});

test('recognizing', function (assert) {
  assert.expect(7);

  let map = createMap(() => [
    route('foo', { path: 'foo/:foo_id' }, () => [
      route('foochild', { path: 'foochild2' }),
      state('admin', (adminState) => [
        route('posts'),
        when({ foo: 123 }, () => [
          route('comments')
        ]),
        when({ other: 123 }, () => [
          route('comments')
        ]),
      ]),
      state('my-service')
    ]),
    route('bar'),
  ]);

  let result;
  result = map.recognize('foo/123/foochild2');
  assert.deepEqual(mapResult(result), ['foo_.0', 'foochild_.0.0']);
  result = map.recognize('bar');
  assert.deepEqual(mapResult(result), ['bar_.1']);
  result = map.recognize('foo/123/posts');
  assert.deepEqual(mapResult(result), ['foo_.0', 'admin_.0.1', 'posts_.0.1.0']);
  result = map.recognize('foo/123/comments');
  assert.deepEqual(mapResult(result), ['foo_.0', 'admin_.0.1', 'when_.0.1.1', 'comments_.0.1.1.0']);

  let results = map.recognizeAll('foo/123/comments');
  assert.equal(results.length, 2);
  assert.deepEqual(mapResult(results[0]), [ "foo_.0", "admin_.0.1", "when_.0.1.1", "comments_.0.1.1.0" ]);
  assert.deepEqual(mapResult(results[1]), [ "foo_.0", "admin_.0.1", "when_.0.1.2", "comments_.0.1.2.0" ]);
});

test('nested state paradigm', function (assert) {
  assert.expect(2);

  let map = createMap(() => [
    state('s1', () => [
      state('s2', () => [
        route('bar')
      ]),
    ]),
  ]);

  let results;
  results = map.recognizeAll('bar');
  assert.equal(results.length, 1);
  assert.deepEqual(mapResult(results[0]), [ "s1_.0", "s2_.0.0", "bar_.0.0.0" ]);
});

function mapResult(result) {
  return (result || []).map((obj) => `${obj.handler.name}_${obj.handler.key}`)
}