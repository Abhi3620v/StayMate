/**
 * Dynamic script injector for Google Maps Platform JS SDK
 * Automatically instantiates an offline mock emulator if API Key is not set
 */
let isLoadInitiated = false;
let loadPromise = null;

export const loadMapScript = () => {
  if (loadPromise) return loadPromise;
  
  loadPromise = new Promise((resolve) => {
    // 1. Resolve immediately if already initialized
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

    // 2. Check if API key is blank -> Instantiate offline simulator immediately
    if (!apiKey) {
      console.log('🔌 [Google Maps loading offline emulation loader]');
      resolve(instantiateMockMaps());
      return;
    }

    if (isLoadInitiated) return;
    isLoadInitiated = true;

    // 3. Dynamic Script Tag creation
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Set a safety timeout - if maps doesn't load in 3.5 seconds, fallback to mock map
    const timeout = setTimeout(() => {
      console.warn('⚠️ [Google Maps Platform timeout. Falling back to emulation simulator]');
      resolve(instantiateMockMaps());
    }, 3500);

    script.onload = () => {
      clearTimeout(timeout);
      console.log('✅ [Google Maps Platform SDK loaded successfully]');
      resolve(window.google.maps);
    };

    script.onerror = () => {
      clearTimeout(timeout);
      console.error('❌ [Google Maps Platform script loading failed. Emulating...]');
      resolve(instantiateMockMaps());
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

/**
 * Standard Google Maps JS SDK emulation classes
 * Allows standard maps component to run offline without throwing script errors
 */
const instantiateMockMaps = () => {
  window.google = window.google || {};
  
  const mockMaps = {
    Map: class MockMap {
      constructor(element, options) {
        this.element = element;
        this.options = options || {};
        this.listeners = {};
        this.center = options.center || { lat: 28.6282, lng: 77.3789 };
        this.zoom = options.zoom || 12;
        
        // Render simple mock visual container
        this.element.innerHTML = `
          <div style="width: 100%; height: 100%; background: #eae7e1; position: relative; font-family: sans-serif; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; border-radius: inherit;">
            <svg style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
              <!-- Parks (Green areas) -->
              <rect x="30" y="40" width="220" height="180" rx="30" fill="#d2e5ca" />
              <rect x="520" y="80" width="310" height="280" rx="40" fill="#d2e5ca" />
              <rect x="200" y="440" width="340" height="150" rx="25" fill="#d2e5ca" />
              
              <!-- Water body (Blue river) -->
              <path d="M -50 480 Q 200 420 400 520 T 850 420 L 850 500 Q 600 600 400 570 T -50 570 Z" fill="#b9d6f3" />
              <path d="M 120 -50 Q 150 150 90 320 T 260 650" fill="none" stroke="#b9d6f3" stroke-width="26" stroke-linecap="round" opacity="0.6" />

              <!-- Urban Areas / Buildings Mockups -->
              <rect x="80" y="270" width="55" height="35" rx="6" fill="#dedbd2" />
              <rect x="150" y="270" width="45" height="45" rx="6" fill="#dedbd2" />
              <rect x="90" y="330" width="75" height="45" rx="6" fill="#dedbd2" />
              <rect x="380" y="140" width="110" height="80" rx="10" fill="#dedbd2" />
              
              <!-- Streets / Roads (Yellow & White lines) -->
              <path d="M 0 150 L 800 150" stroke="#ffffff" stroke-width="8" />
              <path d="M 0 150 L 800 150" stroke="#fcd34d" stroke-width="2" />
              
              <path d="M 0 320 L 800 320" stroke="#ffffff" stroke-width="12" />
              <path d="M 0 320 L 800 320" stroke="#f59e0b" stroke-width="2" stroke-dasharray="10, 10" />

              <path d="M 300 0 L 300 600" stroke="#ffffff" stroke-width="10" />
              <path d="M 300 0 L 300 600" stroke="#fcd34d" stroke-width="2" />

              <path d="M 520 0 L 520 600" stroke="#ffffff" stroke-width="8" />
              
              <!-- Minor streets -->
              <path d="M 100 0 Q 220 200 450 300 T 800 500" fill="none" stroke="#ffffff" stroke-width="5" />
              <path d="M 0 450 Q 300 300 800 250" fill="none" stroke="#ffffff" stroke-width="5" />
            </svg>
            <div style="position: absolute; inset: 0; opacity: 0.15; background-image: radial-gradient(#64748b 1px, transparent 1px); background-size: 20px 20px;"></div>
            
            <!-- Map Controls Header -->
            <div style="z-index: 10; display: flex; justify-content: space-between; padding: 12px; align-items: center; pointer-events: none;">
              <span style="font-size: 9px; font-weight: 900; background: #ffffff; padding: 5px 10px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-transform: uppercase; color: #475569; tracking: 0.05em; pointer-events: auto;">
                StayMate Mock Map Mode
              </span>
            </div>

            <!-- Draggable Map canvas container -->
            <div id="mock-canvas-inner" style="flex: 1; display: flex; items-center: center; justify-content: center; position: relative; z-index: 5;">
              <div id="mock-pin-center" style="font-size: 24px; position: absolute; pointer-events: none; transition: transform 0.1s;">📍</div>
            </div>

            <!-- Bottom Map bounds specs footer -->
            <div style="z-index: 10; display: flex; justify-content: space-between; padding: 10px; font-size: 9px; font-weight: 700; color: #64748b; background: rgba(255,255,255,0.9); border-top: 1px solid #e2e8f0; pointer-events: auto;">
              <span>Center: ${this.center.lat.toFixed(4)}, ${this.center.lng.toFixed(4)}</span>
              <span>Zoom: ${this.zoom}x</span>
            </div>
          </div>
        `;
      }

      setCenter(latlng) {
        this.center = latlng;
        this.trigger('center_changed');
      }

      getCenter() {
        return {
          lat: () => this.center.lat,
          lng: () => this.center.lng
        };
      }

      setZoom(zoom) {
        this.zoom = zoom;
        this.trigger('zoom_changed');
      }

      getZoom() {
        return this.zoom;
      }

      addListener(event, callback) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(callback);
        return { remove: () => {} };
      }

      trigger(event, data) {
        if (this.listeners[event]) {
          this.listeners[event].forEach(cb => cb(data));
        }
      }
    },

    Marker: class MockMarker {
      constructor(options) {
        this.options = options || {};
        this.position = options.position || { lat: 0, lng: 0 };
        this.draggable = options.draggable || false;
        this.listeners = {};
        this.map = options.map;
        this.element = null;

        if (this.map && this.map.element) {
          this.renderOnMap();
        }
      }

      renderOnMap() {
        const canvas = this.map.element.querySelector('#mock-canvas-inner');
        if (canvas) {
          const pin = document.createElement('div');
          this.element = pin;
          const isBlue = this.options.icon && String(this.options.icon).includes('blue');
          pin.style.position = 'absolute';
          pin.style.cursor = this.draggable ? 'move' : 'pointer';
          pin.style.zIndex = isBlue ? '100' : '10';
          pin.style.transition = 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          pin.title = this.options.title || 'Property Marker';
          
          if (!document.getElementById('sm-mock-map-styles')) {
            const style = document.createElement('style');
            style.id = 'sm-mock-map-styles';
            style.innerHTML = `
              @keyframes mockPulse {
                0% { transform: scale(1.15) translateY(-4px) rotate(-45deg); filter: drop-shadow(0 2px 4px rgba(37, 99, 235, 0.4)); }
                100% { transform: scale(1.25) translateY(-8px) rotate(-45deg); filter: drop-shadow(0 6px 12px rgba(37, 99, 235, 0.7)); }
              }
              .sm-marker-teardrop {
                width: 24px;
                height: 24px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 6px rgba(0,0,0,0.15);
                border: 2px solid #ffffff;
                transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              }
              .sm-marker-inner {
                width: 8px;
                height: 8px;
                background: #ffffff;
                border-radius: 50%;
                transform: rotate(45deg);
                box-shadow: inset 0 1px 2px rgba(0,0,0,0.25);
              }
              .sm-marker-teardrop-active {
                animation: mockPulse 1.2s infinite alternate;
              }
              .sm-marker-teardrop-inactive {
                transform: translateY(-2px) rotate(-45deg);
              }
            `;
            document.head.appendChild(style);
          }

          if (isBlue) {
            pin.innerHTML = `
              <div class="sm-marker-teardrop sm-marker-teardrop-active" style="background: linear-gradient(135deg, #2563eb, #3b82f6); border-color: #ffffff;">
                <div class="sm-marker-inner"></div>
              </div>
            `;
          } else {
            pin.innerHTML = `
              <div class="sm-marker-teardrop sm-marker-teardrop-inactive" style="background: linear-gradient(135deg, #db2777, #f43f5e); border-color: #ffffff;">
                <div class="sm-marker-inner"></div>
              </div>
            `;
          }
          
          // Position pins relative to center coordinates
          const latCenter = this.map.center ? (typeof this.map.center.lat === 'function' ? this.map.center.lat() : this.map.center.lat) : 28.6282;
          const lngCenter = this.map.center ? (typeof this.map.center.lng === 'function' ? this.map.center.lng() : this.map.center.lng) : 77.3789;
          
          const leftOffset = 50 + (this.position.lng - lngCenter) * 1200;
          const topOffset = 50 - (this.position.lat - latCenter) * 1200;
          
          pin.style.left = `${Math.max(8, Math.min(92, leftOffset))}%`;
          pin.style.top = `${Math.max(8, Math.min(92, topOffset))}%`;
          
          if (this.draggable) {
            // Simulated simple drag trigger handles
            pin.onmousedown = (e) => {
              e.preventDefault();
              document.onmousemove = (moveEvent) => {
                this.position.lat += (Math.random() - 0.5) * 0.002;
                this.position.lng += (Math.random() - 0.5) * 0.002;
                this.trigger('drag');
              };
              document.onmouseup = () => {
                document.onmousemove = null;
                document.onmouseup = null;
                this.trigger('dragend');
              };
            };
          } else {
            pin.onclick = () => this.trigger('click');
          }

          canvas.appendChild(pin);
        }
      }

      setPosition(latlng) {
        this.position = latlng;
      }

      getPosition() {
        return {
          lat: () => this.position.lat,
          lng: () => this.position.lng
        };
      }

      setMap(map) {
        this.map = map;
        if (!map && this.element) {
          this.element.remove();
          this.element = null;
        } else if (map && map.element && !this.element) {
          this.renderOnMap();
        }
      }

      setDraggable(flag) {
        this.draggable = flag;
      }

      addListener(event, callback) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(callback);
        return { remove: () => {} };
      }

      trigger(event, data) {
        if (this.listeners[event]) {
          this.listeners[event].forEach(cb => cb(data));
        }
      }
    },

    places: {
      Autocomplete: class MockAutocomplete {
        constructor(inputElement, options) {
          this.inputElement = inputElement;
          this.options = options || {};
          this.listeners = {};
        }

        addListener(event, callback) {
          this.listeners[event] = this.listeners[event] || [];
          this.listeners[event].push(callback);
        }

        trigger(event, data) {
          if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
          }
        }

        getPlace() {
          return {
            formatted_address: this.inputElement.value || 'Sector 62, Noida, UP, India',
            geometry: {
              location: {
                lat: () => 28.6282,
                lng: () => 77.3789
              }
            },
            address_components: [
              { long_name: 'India', types: ['country'] },
              { long_name: 'Uttar Pradesh', types: ['administrative_area_level_1'] },
              { long_name: 'Noida', types: ['locality'] },
              { long_name: 'Sector 62', types: ['sublocality'] },
              { long_name: '201301', types: ['postal_code'] }
            ],
            place_id: 'mock_place_autocomplete_preset'
          };
        }
      }
    },

    LatLngBounds: class MockBounds {
      extend() {}
      getCenter() {
        return { lat: () => 28.6282, lng: () => 77.3789 };
      }
    },

    InfoWindow: class MockInfoWindow {
      open() {}
      close() {}
      setContent() {}
    },

    DirectionsService: class MockDirectionsService {
      route(options, callback) {
        callback({ status: 'OK' }, 'OK');
      }
    },

    DirectionsRenderer: class MockDirectionsRenderer {
      setMap() {}
      setDirections() {}
    }
  };

  window.google.maps = mockMaps;
  return mockMaps;
};
