import GoogleMapsService from '../services/GoogleMapsService.js';
import PropertyRepository from '../../property/repositories/propertyRepository.js';
import { mockProperties } from '../../../config/inMemoryDb.js';

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
  console.log('🚀 [STARTING MAPS & GEOLOCATION SYSTEM INTEGRATION TESTS]\n');

  // 1. Test Autocomplete
  console.log('--- testing Autocomplete ---');
  const autocompleteResults = await GoogleMapsService.getAutocomplete('Noida');
  assertEqual(Array.isArray(autocompleteResults), true, 'Autocomplete should return array');
  assertEqual(autocompleteResults.length > 0, true, 'Autocomplete results should not be empty');
  assertEqual(autocompleteResults[0].description.includes('Noida'), true, 'First prediction should match Noida input');

  // 2. Test Geocoding
  console.log('\n--- testing Geocoding ---');
  const geocodeResult = await GoogleMapsService.geocode(null, 'ChIJj70dG9DkDDkRc7_pGoa3V8k'); // Noida preset
  assertEqual(geocodeResult.city, 'Noida', 'Geocode should resolve city component Noida');
  assertEqual(typeof geocodeResult.latitude, 'number', 'Geocode should return latitude number');
  assertEqual(geocodeResult.pinCode, '201301', 'Geocode should resolve pincode');

  // 3. Test Reverse Geocoding
  console.log('\n--- testing Reverse Geocoding ---');
  const reverseResult = await GoogleMapsService.reverseGeocode(18.4529, 73.8652); // Pune preset
  assertEqual(reverseResult.city, 'Pune', 'Reverse geocode should match closest preset city Pune');
  assertEqual(reverseResult.pinCode, '411046', 'Reverse geocode should match Pune pincode');

  // 4. Test Nearby Transit Landmarks
  console.log('\n--- testing Nearby places transit listings ---');
  const nearbyPlaces = await GoogleMapsService.getNearbyPlaces(28.6282, 77.3789);
  assertEqual(Array.isArray(nearbyPlaces), true, 'Nearby places should return array');
  assertEqual(nearbyPlaces.length > 0, true, 'Nearby places should not be empty');
  assertEqual(nearbyPlaces[0].type, 'Metro Station', 'Nearby list should start with Metro Station transit nodes');
  assertEqual(typeof nearbyPlaces[0].distance, 'string', 'Distance should be string format');

  // 5. Test Property Geofiltering Radius Search
  console.log('\n--- testing Property Repository geofiltering radius search ---');
  mockProperties.length = 0; // Clear mock DB
  
  // Seed two properties (Noida Sector 62 vs Pune Katraj)
  mockProperties.push(
    {
      _id: 'prop_noida_62',
      title: 'PG Stay Noida Sector 62',
      status: 'published',
      location: { latitude: 28.6282, longitude: 77.3789 }
    },
    {
      _id: 'prop_pune_katraj',
      title: 'Room Stay Pune Katraj',
      status: 'published',
      location: { latitude: 18.4529, longitude: 73.8652 }
    }
  );
  
  // Search within 5km radius of Noida Sector 62 coordinates
  const matchNoida = await PropertyRepository.find({
    lat: 28.6282,
    lng: 77.3789,
    radius: 5000 // 5km in meters
  });
  
  assertEqual(matchNoida.length, 1, 'Should find exactly 1 property listing matching Noida bounds');
  assertEqual(matchNoida[0]._id, 'prop_noida_62', 'Resolved property ID should match Noida listing');

  // Search within 2500km radius of Noida Sector 62 coordinates (to find both)
  const matchLargeRadius = await PropertyRepository.find({
    lat: 28.6282,
    lng: 77.3789,
    radius: 2000000 // Large radius (2000km) to map both Pune and Noida
  });
  assertEqual(matchLargeRadius.length, 2, 'Should find both property listings matching large bounds');

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
