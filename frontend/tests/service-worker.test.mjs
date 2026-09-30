import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const swSource = readFileSync(new URL('../public/service-worker.js', import.meta.url), 'utf8');

test('service worker avoids caching authenticated and private API data', () => {
  assert.doesNotMatch(swSource, /cache\.addAll\s*\(|caches\.match\(event\.request\)/);
  assert.match(swSource, /isApiRequest|shouldBypassCache|request\.method !== 'GET'|fetch\(event\.request\)\.catch/);
});

test('service worker uses versioned cache names and cleanup', () => {
  assert.match(swSource, /CACHE_VERSION|STATIC_CACHE|RUNTIME_CACHE|NAVIGATION_CACHE|IMAGE_CACHE|caches\.keys\(\)|caches\.delete\(\)|self\.clients\.claim\(\)/);
});
