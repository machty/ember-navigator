import { click, currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | basic', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /', async function (assert) {
    await visit('/');
    assert.strictEqual(currentURL(), '/');
    assert.dom('.ecr-app-container h3').hasText('Login');
    await click('[data-test-navigate="logged-in-default-0"]');
    assert.dom('.ecr-app-container h3').hasText('Root Cellar');
    await click('[data-test-navigate="frame-tweet-123-3"]');
    assert.dom('.ecr-app-container h3').hasText('Tweet 123');
    await click('[data-test-navigate="frame-tweet-456-4"]');
    assert.dom('.ecr-app-container h3').hasText('Tweet 456');
    await click('[data-test-back]');
    assert.dom('.ecr-app-container h3').hasText('Tweet 123');
    await click('[data-test-back]');
    assert.dom('.ecr-app-container h3').hasText('Root Cellar');
    await click('[data-test-navigate="logged-out-default-0"]');
    assert.dom('.ecr-app-container h3').hasText('Login');
  });
});
