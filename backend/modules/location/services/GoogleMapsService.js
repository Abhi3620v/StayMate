import crypto from 'crypto';

// Haversine distance calculator utility
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // returns distance in km
};

class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    this.isMockMode = !this.apiKey || process.env.NODE_ENV === 'test';
    
    // Preset of structured location targets for Noida, Delhi, Pune, Mumbai mock queries
    this.mockAddresses = [
      {
        description: 'Sector 62, Noida, Uttar Pradesh, India',
        placeId: 'ChIJj70dG9DkDDkRc7_pGoa3V8k',
        street: 'Sector 62 Road B',
        area: 'Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        country: 'India',
        pinCode: '201301',
        latitude: 28.6282,
        longitude: 77.3789
      },
      {
        description: 'Katraj, Pune, Maharashtra, India',
        placeId: 'ChIJx_t3bXfBwjsRG_q7lWcZ_9A',
        street: 'Katraj Kondhwa Rd',
        area: 'Katraj',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        pinCode: '411046',
        latitude: 18.4529,
        longitude: 73.8652
      },
      {
        description: 'Connaught Place, New Delhi, Delhi, India',
        placeId: 'ChIJCX3z-p_DDTkR5b2lWqE-B7g',
        street: 'Radial Road 1',
        area: 'Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pinCode: '110001',
        latitude: 28.6304,
        longitude: 77.2177
      },
      {
        description: 'Andheri West, Mumbai, Maharashtra, India',
        placeId: 'ChIJz2t6xnf55zsR2o4u6h4V_8c',
        street: 'Link Road',
        area: 'Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pinCode: '400053',
        latitude: 19.1197,
        longitude: 72.8468
      }
    ];
  }

  /**
   * Autocomplete address searches
   */
  async getAutocomplete(input) {
    if (this.isMockMode) {
      if (!input || input.trim().length < 3) return [];
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=5&countrycodes=in`, {
          headers: { 'User-Agent': 'StayMate-App' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            return data.map(item => ({
              description: item.display_name,
              placeId: `osm_${item.place_id}_${item.lat}_${item.lon}`
            }));
          }
        }
      } catch (err) {
        console.warn('Nominatim Autocomplete fallback failed:', err.message);
      }

      const query = input.toLowerCase();
      const matched = this.mockAddresses.filter(addr => 
        addr.description.toLowerCase().includes(query) ||
        addr.city.toLowerCase().includes(query) ||
        addr.area.toLowerCase().includes(query)
      );
      
      // Fallback dynamic autocomplete generation if no preset matches
      if (matched.length === 0) {
        return [{
          description: `${input}, City Center, India`,
          placeId: `mock_place_${crypto.randomBytes(8).toString('hex')}`
        }];
      }
      
      return matched.map(addr => ({
        description: addr.description,
        placeId: addr.placeId
      }));
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${this.apiKey}&components=country:in`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Google API returned status ${res.status}`);
      const data = await res.json();
      return (data.predictions || []).map(p => ({
        description: p.description,
        placeId: p.place_id
      }));
    } catch (err) {
      console.error('Google Autocomplete API Error:', err.message);
      throw err;
    }
  }

  /**
   * Geocode a placeId or address string
   */
  async geocode(address, placeId = null) {
    if (this.isMockMode) {
      // 1. Resolve OSM placeId if format is recognized
      if (placeId && placeId.startsWith('osm_')) {
        const parts = placeId.split('_');
        const lat = Number(parts[2]);
        const lng = Number(parts[3]);
        return {
          description: address || 'Geocoded Address, India',
          placeId,
          street: 'Main Road',
          area: 'Locality',
          city: 'Noida',
          state: 'Uttar Pradesh',
          country: 'India',
          pinCode: '201301',
          latitude: lat,
          longitude: lng
        };
      }

      // 2. Fallback Nominatim address search
      if (!placeId && address) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=1&countrycodes=in`, {
            headers: { 'User-Agent': 'StayMate-App' }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              const item = data[0];
              const addr = item.address || {};
              return {
                description: item.display_name,
                placeId: `osm_${item.place_id}_${item.lat}_${item.lon}`,
                street: addr.road || addr.suburb || '',
                area: addr.suburb || addr.neighbourhood || '',
                city: addr.city || addr.town || addr.county || 'Noida',
                state: addr.state || 'Uttar Pradesh',
                country: addr.country || 'India',
                pinCode: addr.postcode || '201301',
                latitude: Number(item.lat),
                longitude: Number(item.lon)
              };
            }
          }
        } catch (err) {
          console.warn('Nominatim Geocoding failed:', err.message);
        }
      }

      const matched = this.mockAddresses.find(addr => 
        (placeId && addr.placeId === placeId) || 
        (!placeId && addr.description.toLowerCase().includes(address.toLowerCase()))
      );
      if (matched) return matched;
      
      // Dynamic coordinate mapping fallback with keyword intelligence
      let lat = 28.628;
      let lng = 77.382;
      let city = 'Noida';
      let state = 'Uttar Pradesh';
      let pinCode = '201301';

      if (address) {
        const addrLower = address.toLowerCase();
        if (addrLower.includes('greater noida') || addrLower.includes('knowledge park')) {
          lat = 28.474;
          lng = 77.504;
          city = 'Greater Noida';
        } else if (addrLower.includes('delhi') || addrLower.includes('new delhi')) {
          lat = 28.613;
          lng = 77.209;
          city = 'New Delhi';
          state = 'Delhi';
          pinCode = '110001';
        } else if (addrLower.includes('pune') || addrLower.includes('katraj')) {
          lat = 18.520;
          lng = 73.856;
          city = 'Pune';
          state = 'Maharashtra';
          pinCode = '411001';
        } else if (addrLower.includes('mumbai') || addrLower.includes('bandra')) {
          lat = 19.076;
          lng = 72.877;
          city = 'Mumbai';
          state = 'Maharashtra';
          pinCode = '400001';
        } else if (addrLower.includes('bangalore') || addrLower.includes('bengaluru')) {
          lat = 12.971;
          lng = 77.594;
          city = 'Bengaluru';
          state = 'Karnataka';
          pinCode = '560001';
        }
      }

      return {
        description: address || 'Custom Location, India',
        placeId: placeId || `mock_place_${crypto.randomBytes(8).toString('hex')}`,
        street: 'Main Road',
        area: 'Locality',
        city,
        state,
        country: 'India',
        pinCode,
        latitude: lat + (Math.random() - 0.5) * 0.01,
        longitude: lng + (Math.random() - 0.5) * 0.01
      };
    }

    try {
      let url = '';
      if (placeId) {
        url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${this.apiKey}`;
      } else {
        url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Google API returned status ${res.status}`);
      const data = await res.json();
      
      if (!data.results || data.results.length === 0) {
        throw new Error('Geocoding result not found for query');
      }

      const result = data.results[0];
      const coords = result.geometry.location;
      
      // Extract structured address parts
      const components = result.address_components || [];
      const getComponent = (types) => {
        const comp = components.find(c => c.types.some(t => types.includes(t)));
        return comp ? comp.long_name : '';
      };

      return {
        description: result.formatted_address,
        placeId: result.place_id,
        street: getComponent(['route', 'street_number']),
        area: getComponent(['sublocality', 'neighborhood']),
        city: getComponent(['locality', 'administrative_area_level_2']),
        state: getComponent(['administrative_area_level_1']),
        country: getComponent(['country']),
        pinCode: getComponent(['postal_code']),
        latitude: coords.lat,
        longitude: coords.lng
      };
    } catch (err) {
      console.error('Google Geocode API Error:', err.message);
      throw err;
    }
  }

  /**
   * Reverse Geocode coordinate nodes to address fields
   */
  async reverseGeocode(lat, lng) {
    if (this.isMockMode) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
          headers: { 'User-Agent': 'StayMate-App' }
        });
        if (res.ok) {
          const item = await res.json();
          const addr = item.address || {};
          return {
            description: item.display_name,
            placeId: `osm_${item.place_id}_${lat}_${lng}`,
            street: addr.road || addr.suburb || '',
            area: addr.suburb || addr.neighbourhood || '',
            city: addr.city || addr.town || addr.county || 'Noida',
            state: addr.state || 'Uttar Pradesh',
            country: addr.country || 'India',
            pinCode: addr.postcode || '201301',
            latitude: Number(lat),
            longitude: Number(lng)
          };
        }
      } catch (err) {
        console.warn('Nominatim Reverse Geocoding failed:', err.message);
      }

      // Find closest mock preset using simple distance matrix checks
      let closest = this.mockAddresses[0];
      let minDist = Infinity;
      
      this.mockAddresses.forEach(addr => {
        const d = haversineDistance(lat, lng, addr.latitude, addr.longitude);
        if (d < minDist) {
          minDist = d;
          closest = addr;
        }
      });

      return {
        ...closest,
        latitude: Number(lat),
        longitude: Number(lng),
        description: `Simulated Near ${closest.street}, ${closest.area}, ${closest.city}`
      };
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Google API returned status ${res.status}`);
      const data = await res.json();
      
      if (!data.results || data.results.length === 0) {
        throw new Error('Reverse geocoding result not found for coordinates');
      }

      const result = data.results[0];
      const components = result.address_components || [];
      const getComponent = (types) => {
        const comp = components.find(c => c.types.some(t => types.includes(t)));
        return comp ? comp.long_name : '';
      };

      return {
        description: result.formatted_address,
        placeId: result.place_id,
        street: getComponent(['route', 'street_number']),
        area: getComponent(['sublocality', 'neighborhood']),
        city: getComponent(['locality', 'administrative_area_level_2']),
        state: getComponent(['administrative_area_level_1']),
        country: getComponent(['country']),
        pinCode: getComponent(['postal_code']),
        latitude: Number(lat),
        longitude: Number(lng)
      };
    } catch (err) {
      console.error('Google Reverse Geocode API Error:', err.message);
      throw err;
    }
  }

  /**
   * Fetch nearby landmarks (Transit, schools, colleges, cafes)
   */
  async getNearbyPlaces(lat, lng) {
    // Standard mock presets of landmark types
    const landmarkPresets = [
      { type: 'Metro Station', baseName: 'Metro Transit Station', speed: 80 }, // meters/min
      { type: 'Bus Stop', baseName: 'Local Terminal Bus Stop', speed: 80 },
      { type: 'Hospital', baseName: 'City Care Hospital & Clinic', speed: 80 },
      { type: 'Pharmacy', baseName: 'Apollo Medplus Pharmacy', speed: 80 },
      { type: 'School', baseName: 'Public Convent Secondary School', speed: 80 },
      { type: 'College / University', baseName: 'JIIT / Amity / University Campus', speed: 80 },
      { type: 'Restaurant', baseName: 'Grill & Curry Restaurant', speed: 80 },
      { type: 'Cafe', baseName: 'Starbucks Cafe House', speed: 80 },
      { type: 'Mall', baseName: 'City Center Shopping Mall', speed: 80 },
      { type: 'Gym', baseName: 'Gold Fitness Gym Center', speed: 80 },
      { type: 'Bank / ATM', baseName: 'HDFC Bank ATM Counter', speed: 80 },
      { type: 'Railway Station', baseName: 'City Junction Railway', speed: 300 }, // driving/transit speed
      { type: 'Airport', baseName: 'International Airport Hub', speed: 600 }
    ];

    if (this.isMockMode) {
      try {
        const query = `[out:json];node(around:2000,${lat},${lng})["amenity"~"university|school|hospital|cafe|restaurant|subway_station|bus_station|bank|pharmacy|marketplace|townhall"];out 15;`;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const response = await fetch(url, { headers: { 'User-Agent': 'StayMate-App' } });
        if (response.ok) {
          const body = await response.json();
          const elements = body.elements || [];
          const validNodes = elements.filter(el => el.tags && el.tags.name);
          if (validNodes.length > 0) {
            return validNodes.map((el) => {
              const amenity = el.tags.amenity || '';
              let type = 'Landmark';
              if (amenity === 'subway_station' || el.tags.railway === 'station') type = 'Metro Station';
              else if (amenity === 'bus_station' || el.tags.highway === 'bus_stop') type = 'Bus Stop';
              else if (amenity === 'hospital' || amenity === 'clinic') type = 'Hospital';
              else if (amenity === 'pharmacy') type = 'Pharmacy';
              else if (amenity === 'university' || amenity === 'college' || amenity === 'school') type = 'College / University';
              else if (amenity === 'cafe') type = 'Cafe';
              else if (amenity === 'restaurant') type = 'Restaurant';
              else if (amenity === 'bank' || amenity === 'atm') type = 'Bank / ATM';
              
              const distanceKm = Number(haversineDistance(lat, lng, el.lat, el.lon).toFixed(2));
              const speed = type === 'Airport' || type === 'Railway Station' ? 300 : 80;
              const travelTimeMin = Math.max(1, Math.round((distanceKm * 1000) / speed));
              const mode = distanceKm > 2 ? 'drive' : 'walk';
              
              return {
                type,
                name: el.tags.name,
                distance: `${distanceKm} km`,
                time: `${travelTimeMin} mins ${mode}`,
                lat: el.lat,
                lng: el.lon
              };
            });
          }
        }
      } catch (err) {
        console.warn('Overpass POIs lookup failed, using preset mock data:', err.message);
      }

      return landmarkPresets.map((preset, idx) => {
        // Calculate a realistic distance offset (0.3km to 18km depending on speed/type)
        const distanceKm = preset.type === 'Airport' 
          ? 22.4 
          : preset.type === 'Railway Station' 
          ? 6.8 
          : Number((0.2 + (idx * 0.15) + (Math.sin(idx) * 0.1)).toFixed(2));
        
        const travelTimeMin = Math.max(1, Math.round((distanceKm * 1000) / preset.speed));
        const mode = distanceKm > 2 ? 'drive' : 'walk';

        return {
          type: preset.type,
          name: `${preset.baseName} (${idx + 1})`,
          distance: `${distanceKm} km`,
          time: `${travelTimeMin} mins ${mode}`,
          lat: Number(lat) + ((idx * 0.0012) - 0.006),
          lng: Number(lng) + ((idx * 0.0012) - 0.006)
        };
      });
    }

    try {
      // Live Google Places API Query
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&key=${this.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Google Places API returned status ${res.status}`);
      const data = await res.json();
      
      const items = data.results || [];
      return items.slice(0, 15).map(item => {
        const types = item.types || [];
        let type = 'Landmark';
        if (types.includes('subway_station')) type = 'Metro Station';
        else if (types.includes('bus_station')) type = 'Bus Stop';
        else if (types.includes('hospital')) type = 'Hospital';
        else if (types.includes('school') || types.includes('university')) type = 'College / University';
        else if (types.includes('cafe')) type = 'Cafe';
        else if (types.includes('restaurant')) type = 'Restaurant';
        else if (types.includes('atm') || types.includes('bank')) type = 'Bank / ATM';

        // Calculate straight line distance
        const lat2 = item.geometry?.location?.lat;
        const lng2 = item.geometry?.location?.lng;
        let distanceKm = 0.8;
        if (lat2 && lng2) {
          distanceKm = Number(haversineDistance(lat, lng, lat2, lng2).toFixed(2));
        }

        const travelTimeMin = Math.max(1, Math.round((distanceKm * 1000) / 80)); // 80 meters/min avg walk
        const mode = distanceKm > 2 ? 'drive' : 'walk';

        return {
          type,
          name: item.name,
          distance: `${distanceKm} km`,
          time: `${travelTimeMin} mins ${mode}`,
          lat: lat2,
          lng: lng2
        };
      });
    } catch (err) {
      console.warn('Google Places API Error fallback:', err.message);
      // Return mock elements as backup if api failed
      return landmarkPresets.map((preset, idx) => {
        const distanceKm = preset.type === 'Airport' 
          ? 22.4 
          : preset.type === 'Railway Station' 
          ? 6.8 
          : Number((0.2 + (idx * 0.15) + (Math.sin(idx) * 0.1)).toFixed(2));
        const travelTimeMin = Math.max(1, Math.round((distanceKm * 1000) / preset.speed));
        const mode = distanceKm > 2 ? 'drive' : 'walk';
        return {
          type: preset.type,
          name: `${preset.baseName} (Fallback)`,
          distance: `${distanceKm} km`,
          time: `${travelTimeMin} mins ${mode}`,
          lat: Number(lat) + ((idx * 0.0012) - 0.006),
          lng: Number(lng) + ((idx * 0.0012) - 0.006)
        };
      });
    }
  }
}

export default new GoogleMapsService();
