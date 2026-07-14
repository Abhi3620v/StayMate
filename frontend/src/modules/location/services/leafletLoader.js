/**
 * Dynamic script injector for LeafletJS Map SDK
 * Allows keyless OSM rendering on the frontend
 */
let isLoadInitiated = false;
let loadPromise = null;

export const loadLeafletScript = () => {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // 1. Resolve immediately if already initialized
    if (window.L) {
      resolve(window.L);
      return;
    }

    if (isLoadInitiated) return;
    isLoadInitiated = true;

    console.log('🔌 [Leaflet dynamic loader initiated]');

    // 2. Inject Leaflet CSS Link tag
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // 3. Inject Leaflet JS Script tag
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;

    script.onload = () => {
      console.log('✅ [Leaflet dynamic loader script loaded successfully]');
      resolve(window.L);
    };

    script.onerror = (err) => {
      console.error('❌ [Leaflet dynamic loader script loading failed]');
      reject(err);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};
