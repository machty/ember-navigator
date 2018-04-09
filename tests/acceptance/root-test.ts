import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { click, fillIn, find, findAll, keyEvent, triggerEvent } from 'ember-native-dom-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | root', function(hooks) {
  setupApplicationTest(hooks);

  test('navigating to inaccessible URL causes redirect', async function(assert) {
    await visit('/demo');
    await visit('/demo/request-ride');
    assert.equal(currentURL(), '/demo/login');
  });

  test('state changes update the url', async function(assert) {
    await visit('/demo/login');
    await click('[data-test="simulate-user-login"]')
    assert.equal(currentURL(), '/demo/request-ride');
    await click('[data-test="simulate-riding"]')
    assert.equal(currentURL(), '/demo/riding');
  });
});
