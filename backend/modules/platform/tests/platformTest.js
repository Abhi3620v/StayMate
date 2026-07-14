import cacheService from '../cache/cacheService.js';
import searchService from '../search/searchService.js';
import jobScheduler from '../jobs/jobScheduler.js';

let passed = 0;
let failed = 0;

const assertEqual = (actual, expected, msg) => {
  if (actual === expected) {
    console.log(`  ✓ [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${msg} | Expected: ${expected} | Got: ${actual}`);
    failed++;
  }
};

const runTests = async () => {
  console.log('🚀 [STARTING PLATFORM SAAS MODULE INTEGRATION TESTS]\n');

  // 1. Caching Engine Tests
  console.log('--- testing Caching Service ---');
  cacheService.clear();
  cacheService.set('user:profile:1', { name: 'Alice' }, 10);
  
  let val = cacheService.get('user:profile:1');
  assertEqual(val?.name, 'Alice', 'Should retrieve saved cache item');

  let missingVal = cacheService.get('user:profile:999');
  assertEqual(missingVal, null, 'Should return null for non-existing key');

  // Test Pattern Invalidation
  cacheService.set('properties:search:1', 'results1');
  cacheService.set('properties:search:2', 'results2');
  cacheService.set('users:search:1', 'user1');

  const count = cacheService.invalidatePattern('properties:');
  assertEqual(count, 2, 'Should invalidate 2 matching keys starting with "properties:"');
  assertEqual(cacheService.get('properties:search:1'), null, 'Invalidated properties key should be null');
  assertEqual(cacheService.get('users:search:1'), 'user1', 'Non-matching users key should still exist');

  const stats = cacheService.getStats();
  assertEqual(stats.size, 2, 'Cache size should contain 2 items');

  // 2. Background Jobs Scheduler Tests
  console.log('\n--- testing Background Job Scheduler ---');
  const jobResult = await jobScheduler.runJob('temp_file_cleanup');
  assertEqual(jobResult.status, 'completed', 'Job should run successfully and return completed status');

  const statuses = await jobScheduler.getJobsStatus();
  const cleanupJob = statuses.find(j => j.name === 'temp_file_cleanup');
  assertEqual(cleanupJob?.status, 'completed', 'Job history status should record run details');
  assertEqual(cleanupJob?.runCount, 1, 'Job run count should increment');

  // 3. Global Search Tests
  console.log('\n--- testing Global Search Engine ---');
  const emptySearch = await searchService.globalSearch('');
  assertEqual(Object.values(emptySearch).every(arr => arr.length === 0), true, 'Blank search queries should return empty listings');

  const keywordSearch = await searchService.globalSearch('test', { category: 'all' });
  assertEqual(typeof keywordSearch, 'object', 'Search should return object grouping categories');

  // Summary
  console.log('\n======================================================');
  console.log(`[TESTS COMPLETED] Passed: ${passed} | Failed: ${failed}`);
  console.log('======================================================');

  if (failed > 0) {
    process.exit(1);
  }
};

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
