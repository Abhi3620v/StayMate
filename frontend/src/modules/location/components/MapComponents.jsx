import React, { useEffect, useRef, useState } from 'react';
import { loadMapScript } from '../services/mapLoader';
import { loadLeafletScript } from '../services/leafletLoader';
import locationService from '../services/locationService';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { 
  MapPin, Compass, Navigation, Navigation2, Search, 
  Map, Loader2, ArrowRight, Check, MapIcon,
  Train, Bus, ShoppingBag, PlusCircle, GraduationCap,
  UtensilsCrossed, Coffee, Dumbbell, ChevronDown, Footprints, Car
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * 1. GoogleMap & MapContainer
 */
export const GoogleMap = ({ 
  center = { lat: 28.6282, lng: 77.3789 }, 
  zoom = 12, 
  properties = [], 
  selectedPropertyId = null,
  onMarkerClick = null,
  draggableMarker = false,
  onMarkerDragEnd = null,
  radius = null // radius in meters
}) => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);

  const leafletMapRef = useRef(null);
  const leafletMarkersRef = useRef([]);

  const hasGoogleKey = !!import.meta.env.VITE_GOOGLE_MAPS_KEY;

  // ----------------------------------------------------
  // GOOGLE MAPS IMPLEMENTATION
  // ----------------------------------------------------

  // Initialize Google Maps SDK and container map instance
  useEffect(() => {
    if (!hasGoogleKey) return;
    let active = true;
    loadMapScript().then((maps) => {
      if (!active || !mapRef.current) return;

      const inst = new maps.Map(mapRef.current, {
        center,
        zoom,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: true,
        mapTypeControl: false,
        fullscreenControl: true
      });

      setMapInstance(inst);
    });

    return () => {
      active = false;
    };
  }, [hasGoogleKey]);

  // Update center dynamically if options update
  useEffect(() => {
    if (hasGoogleKey && mapInstance && center) {
      mapInstance.setCenter(center);
    }
  }, [hasGoogleKey, mapInstance, center?.lat, center?.lng]);

  // Render Google Markers and InfoWindows
  useEffect(() => {
    if (!hasGoogleKey || !mapInstance || !window.google || !window.google.maps) return;

    // Clear old markers
    markers.forEach(m => m.setMap(null));
    const newMarkers = [];

    const maps = window.google.maps;

    // A. Draggable Marker mode (e.g. Property Creator)
    if (draggableMarker) {
      const marker = new maps.Marker({
        position: center,
        map: mapInstance,
        draggable: true,
        title: 'Drag to adjust exact location coordinates'
      });

      marker.addListener('dragend', () => {
        const lat = marker.getPosition().lat();
        const lng = marker.getPosition().lng();
        if (onMarkerDragEnd) {
          onMarkerDragEnd({ lat, lng });
        }
      });

      newMarkers.push(marker);
    } else {
      // B. Marketplace Multiple Listings Marker mode
      const coordCounts = {};

      properties.forEach(prop => {
        let lat = prop.location?.latitude || prop.latitude;
        let lng = prop.location?.longitude || prop.longitude;

        // Fallback: Treat database records having default coordinates as un-geocoded placeholders
        const isDefaultCoords = lat === 28.6139 && lng === 77.2090;
        if (!lat || !lng || isDefaultCoords) {
          const idStr = String(prop._id || prop.id || '');
          const idHash = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const jitterLat = ((idHash % 17) - 8.5) * 0.0035;
          const jitterLng = ((idHash % 23) - 11.5) * 0.0035;
          
          const cityLower = String(prop.location?.city || '').toLowerCase();
          if (cityLower.includes('pune') || cityLower.includes('katraj')) {
            lat = 18.4529 + jitterLat;
            lng = 73.8652 + jitterLng;
          } else if (cityLower.includes('delhi') || cityLower.includes('connaught') || cityLower.includes('new delhi')) {
            lat = 28.6304 + jitterLat;
            lng = 77.2177 + jitterLng;
          } else if (cityLower.includes('mumbai') || cityLower.includes('andheri')) {
            lat = 19.1197 + jitterLat;
            lng = 72.8468 + jitterLng;
          } else {
            // Default Noida
            lat = 28.6282 + jitterLat;
            lng = 77.3789 + jitterLng;
          }
        }

        // Apply a small spiderfy offset if coordinates overlap 100%
        const coordKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
        if (coordCounts[coordKey]) {
          const index = coordCounts[coordKey];
          const angle = (index * 2 * Math.PI) / 8;
          const radius = 0.0016 * (1 + Math.floor(index / 8)); // ~140 meters offset
          lat += radius * Math.sin(angle);
          lng += radius * Math.cos(angle);
          coordCounts[coordKey]++;
        } else {
          coordCounts[coordKey] = 1;
        }

        const coords = { lat, lng };

        const isSelected = String(prop._id || prop.id) === String(selectedPropertyId);
        const isSingleProperty = properties.length === 1;
        
        let markerIcon = null;
        if (isSingleProperty) {
          const svgMarkup = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
              <circle cx="24" cy="24" r="20" fill="black" stroke="white" stroke-width="4" />
              <path d="M17 26v10h5v-6h4v6h5V26l-7-6-7 6z" fill="white" />
              <path d="M13 24l11-9 11 9" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            </svg>
          `;
          markerIcon = {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgMarkup),
            scaledSize: (window.google && window.google.maps && window.google.maps.Size)
              ? new window.google.maps.Size(48, 48)
              : { width: 48, height: 48 },
            anchor: (window.google && window.google.maps && window.google.maps.Point)
              ? new window.google.maps.Point(24, 24)
              : { x: 24, y: 24 }
          };
        } else {
          markerIcon = isSelected ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
        }

        const marker = new maps.Marker({
          position: coords,
          map: mapInstance,
          title: prop.title,
          icon: markerIcon
        });

        // Setup Marker Click Listener
        marker.addListener('click', () => {
          if (onMarkerClick) {
            onMarkerClick(prop._id || prop.id);
          }

          // Open custom info window
          const rentVal = prop.pricing?.monthlyRent || prop.price || 5000;
          const propTitle = prop.title || 'StayMate Rental';
          const detailsUrl = `/properties/${prop._id || prop.id}`;
          
          const infoContent = `
            <div style="font-family: sans-serif; font-size: 11px; max-width: 180px; padding: 4px; line-height: 1.4;">
              <h4 style="margin: 0 0 4px 0; font-size: 12px; font-weight: 800; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${propTitle}</h4>
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #0e8fe3;">₹${rentVal.toLocaleString()}/mo</p>
              <a href="${detailsUrl}" style="display: inline-block; background: #0e8fe3; color: white; text-decoration: none; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 10px;">View Details</a>
            </div>
          `;

          const infoWindow = new maps.InfoWindow({
            content: infoContent
          });

          if (activeMarker) activeMarker.close();
          infoWindow.open(mapInstance, marker);
          setActiveMarker(infoWindow);
        });

        newMarkers.push(marker);
      });
    }

    setMarkers(newMarkers);
  }, [hasGoogleKey, mapInstance, properties, selectedPropertyId, draggableMarker]);

  // ----------------------------------------------------
  // LEAFLET / OPENSTREETMAP FALLBACK IMPLEMENTATION
  // ----------------------------------------------------

  // Initialize Leaflet Map
  useEffect(() => {
    if (hasGoogleKey) return;
    let active = true;

    loadLeafletScript().then((L) => {
      if (!active || !mapRef.current) return;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      console.log('🗺️ [Leaflet Map] Initializing OSM tiles on ref node');
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true
      }).setView([center.lat, center.lng], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      leafletMapRef.current = map;
      setMapInstance(map);
    }).catch(err => {
      console.error('Failed to load Leaflet script:', err.message);
    });

    return () => {
      active = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [hasGoogleKey]);

  // Update Leaflet map center dynamically
  useEffect(() => {
    if (!hasGoogleKey && leafletMapRef.current && center) {
      leafletMapRef.current.setView([center.lat, center.lng]);
    }
  }, [hasGoogleKey, center?.lat, center?.lng]);

  // Render Leaflet Markers and Popups
  useEffect(() => {
    if (hasGoogleKey || !leafletMapRef.current || !window.L) return;

    const L = window.L;

    // Clear old Leaflet markers
    leafletMarkersRef.current.forEach(m => m.remove());
    leafletMarkersRef.current = [];

    const newMarkers = [];
    const coordCounts = {};

    const createLeafletIcon = (isSelected, isSingleProperty) => {
      let color = isSelected ? '#3b82f6' : '#f43f5e';
      if (isSingleProperty) color = '#000000';

      const html = `
        <div class="flex items-center justify-center" style="transform: translate(-12px, -24px);">
          <div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.15); border: 2px solid #ffffff;">
            <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
        </div>
      `;
      return L.divIcon({
        html,
        className: 'custom-leaflet-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });
    };

    if (draggableMarker) {
      const marker = L.marker([center.lat, center.lng], {
        draggable: true,
        icon: createLeafletIcon(true, true),
        title: 'Drag to adjust exact location coordinates'
      }).addTo(leafletMapRef.current);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        if (onMarkerDragEnd) {
          onMarkerDragEnd({ lat: pos.lat, lng: pos.lng });
        }
      });

      newMarkers.push(marker);
    } else {
      properties.forEach(prop => {
        let lat = prop.location?.latitude || prop.latitude;
        let lng = prop.location?.longitude || prop.longitude;

        // Fallback: Treat database records having default coordinates as un-geocoded placeholders
        const isDefaultCoords = lat === 28.6139 && lng === 77.2090;
        if (!lat || !lng || isDefaultCoords) {
          const idStr = String(prop._id || prop.id || '');
          const idHash = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const jitterLat = ((idHash % 17) - 8.5) * 0.0035;
          const jitterLng = ((idHash % 23) - 11.5) * 0.0035;
          
          const cityLower = String(prop.location?.city || '').toLowerCase();
          if (cityLower.includes('pune') || cityLower.includes('katraj')) {
            lat = 18.4529 + jitterLat;
            lng = 73.8652 + jitterLng;
          } else if (cityLower.includes('delhi') || cityLower.includes('connaught') || cityLower.includes('new delhi')) {
            lat = 28.6304 + jitterLat;
            lng = 77.2177 + jitterLng;
          } else if (cityLower.includes('mumbai') || cityLower.includes('andheri')) {
            lat = 19.1197 + jitterLat;
            lng = 72.8468 + jitterLng;
          } else {
            lat = 28.6282 + jitterLat;
            lng = 77.3789 + jitterLng;
          }
        }

        const coordKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
        if (coordCounts[coordKey]) {
          const index = coordCounts[coordKey];
          const angle = (index * 2 * Math.PI) / 8;
          const radius = 0.0016 * (1 + Math.floor(index / 8));
          lat += radius * Math.sin(angle);
          lng += radius * Math.cos(angle);
          coordCounts[coordKey]++;
        } else {
          coordCounts[coordKey] = 1;
        }

        const isSelected = String(prop._id || prop.id) === String(selectedPropertyId);
        const isSingleProperty = properties.length === 1;

        const marker = L.marker([lat, lng], {
          icon: createLeafletIcon(isSelected, isSingleProperty),
          title: prop.title
        }).addTo(leafletMapRef.current);

        const rentVal = prop.pricing?.monthlyRent || prop.price || 5000;
        const propTitle = prop.title || 'StayMate Rental';
        const detailsUrl = `/properties/${prop._id || prop.id}`;
        
        const popupContent = `
          <div style="font-family: sans-serif; font-size: 11px; max-width: 180px; padding: 4px; line-height: 1.4;">
            <h4 style="margin: 0 0 4px 0; font-size: 12px; font-weight: 800; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${propTitle}</h4>
            <p style="margin: 0 0 6px 0; font-weight: 700; color: #0e8fe3;">₹${rentVal.toLocaleString()}/mo</p>
            <a href="${detailsUrl}" style="display: inline-block; background: #0e8fe3; color: white; text-decoration: none; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 10px;">View Details</a>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          if (onMarkerClick) {
            onMarkerClick(prop._id || prop.id);
          }
        });

        newMarkers.push(marker);
      });
    }

    leafletMarkersRef.current = newMarkers;
  }, [hasGoogleKey, properties, selectedPropertyId, draggableMarker]);

  return (
    <div className="relative w-full h-full rounded-[24px] overflow-hidden border border-secondary-200/60 dark:border-secondary-900 shadow-premium-sm">
      <div ref={mapRef} className="w-full h-full min-h-[300px]" />
    </div>
  );
};

/**
 * 2. PlaceAutocomplete
 */
export const PlaceAutocomplete = ({ onSelectAddress, placeholder = "Search street landmark, locality, or sector..." }) => {
  const [input, setInput] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Debounce API requests
  useEffect(() => {
    if (!input || input.length < 3) {
      setPredictions([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await locationService.getAutocomplete(input);
        setPredictions(res.data || []);
        setShowDropdown(true);
      } catch (err) {
        console.warn('Prediction autocomplete failed:', err.message);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [input]);

  // Handle outside click to collapse predictions list
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectSuggestion = async (pred) => {
    setInput(pred.description);
    setShowDropdown(false);
    setLoading(true);
    
    try {
      const res = await locationService.geocode(null, pred.placeId);
      if (res.success && onSelectAddress) {
        onSelectAddress(res.data);
      }
    } catch (err) {
      toast.error('Failed to geocode address location.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="pl-12 pr-10 py-3 bg-white dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-900 rounded-2xl w-full text-xs font-bold"
        />
        <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-secondary-400" />
        {loading && (
          <Loader2 className="absolute right-4 top-3.5 h-4.5 w-4.5 text-primary-500 animate-spin" />
        )}
      </div>

      {showDropdown && predictions.length > 0 && (
        <ul className="absolute left-0 right-0 mt-2 bg-white dark:bg-secondary-950 border border-secondary-100 dark:border-secondary-900 rounded-[18px] shadow-premium-lg z-50 overflow-hidden divide-y divide-secondary-50 dark:divide-secondary-900 text-xs font-semibold text-secondary-750 dark:text-secondary-300">
          {predictions.map((pred) => (
            <li 
              key={pred.placeId} 
              onClick={() => selectSuggestion(pred)}
              className="px-4 py-3 hover:bg-secondary-50/50 dark:hover:bg-secondary-900/40 cursor-pointer flex items-center transition-colors"
            >
              <MapPin className="h-4 w-4 text-secondary-400 mr-2 shrink-0" />
              <span className="truncate">{pred.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * 3. RadiusSelector
 */
export const RadiusSelector = ({ selectedRadius, onRadiusChange }) => {
  const options = [
    { label: 'All Range', value: null },
    { label: '500m Radius', value: 500 },
    { label: '1 km Radius', value: 1000 },
    { label: '2 km Radius', value: 2000 },
    { label: '5 km Radius', value: 5000 },
    { label: '10 km Radius', value: 10000 },
    { label: '20 km Radius', value: 20000 }
  ];

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">Radius Area Search</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onRadiusChange(opt.value)}
            className={`px-3 py-1.5 rounded-[12px] text-[10px] font-extrabold border transition-all ${selectedRadius === opt.value ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white dark:bg-secondary-950 border-secondary-200/50 text-secondary-650 hover:border-primary-200'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * 4. DirectionsButton
 */
export const DirectionsButton = ({ latitude, longitude, label = "Get Directions" }) => {
  const launchOSMNavigation = () => {
    if (!latitude || !longitude) {
      toast.error('Location coordinates unavailable.');
      return;
    }
    const url = `https://www.openstreetmap.org/directions?route=;${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={launchOSMNavigation}
      className="text-[10px] font-black border-primary-500 text-primary-650 hover:bg-primary-50 w-full justify-center"
    >
      <Navigation className="h-3.5 w-3.5 mr-1" /> {label}
    </Button>
  );
};

/**
 * 5. NearbyPlacesCard — Premium grouped nearby places with category icons,
 *    walking/driving badges, expand/collapse, and map highlight callback.
 */

const CATEGORY_CONFIG = {
  'Transport': {
    emoji: '🚇',
    color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    types: ['metro', 'subway', 'rail', 'train', 'transit', 'bus', 'stop', 'station', 'railway', 'airport'],
    getIcon: () => <Train className="h-5 w-5" />
  },
  'Healthcare': {
    emoji: '🏥',
    color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    types: ['hospital', 'clinic', 'medical', 'health', 'pharmacy'],
    getIcon: () => <PlusCircle className="h-5 w-5" />
  },
  'Education': {
    emoji: '🎓',
    color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    types: ['college', 'university', 'school', 'education', 'campus'],
    getIcon: () => <GraduationCap className="h-5 w-5" />
  },
  'Shopping': {
    emoji: '🛍',
    color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    types: ['market', 'supermarket', 'mall', 'store', 'shop', 'bank', 'atm'],
    getIcon: () => <ShoppingBag className="h-5 w-5" />
  },
  'Food & Cafes': {
    emoji: '🍽',
    color: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    types: ['restaurant', 'cafe', 'food', 'dining', 'grill', 'curry', 'starbucks'],
    getIcon: () => <UtensilsCrossed className="h-5 w-5" />
  },
  'Fitness': {
    emoji: '💪',
    color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    types: ['gym', 'fitness', 'yoga', 'sports'],
    getIcon: () => <Dumbbell className="h-5 w-5" />
  }
};

const classifyPlace = (type) => {
  const t = (type || '').toLowerCase();
  for (const [category, config] of Object.entries(CATEGORY_CONFIG)) {
    if (config.types.some(keyword => t.includes(keyword))) return category;
  }
  return 'Transport'; // fallback
};

export const NearbyPlacesCard = ({ latitude, longitude, onPlaceClick }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const INITIAL_COUNT = 6;

  useEffect(() => {
    if (!latitude || !longitude) return;

    const loadPlaces = async () => {
      setLoading(true);
      try {
        const res = await locationService.getNearby(latitude, longitude);
        setPlaces(res.data || []);
      } catch (err) {
        console.warn('Failed to load transit landmarks:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPlaces();
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="py-8 text-center text-[10px] font-bold text-secondary-400 animate-pulse flex items-center justify-center">
        <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary-500" /> Cataloging nearby places...
      </div>
    );
  }

  if (places.length === 0) return null;

  // Group places by category
  const grouped = {};
  places.forEach(pl => {
    const cat = classifyPlace(pl.type);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(pl);
  });

  // Flatten grouped for initial count slicing
  const allOrdered = Object.entries(CATEGORY_CONFIG)
    .filter(([cat]) => grouped[cat]?.length > 0)
    .flatMap(([cat]) => grouped[cat].map(pl => ({ ...pl, _category: cat })));

  const visiblePlaces = expanded ? allOrdered : allOrdered.slice(0, INITIAL_COUNT);

  // Group visible places by category for rendering
  const visibleGrouped = {};
  visiblePlaces.forEach(pl => {
    if (!visibleGrouped[pl._category]) visibleGrouped[pl._category] = [];
    visibleGrouped[pl._category].push(pl);
  });

  const isWalk = (time) => (time || '').toLowerCase().includes('walk');

  return (
    <div className="space-y-5">
      {Object.entries(CATEGORY_CONFIG)
        .filter(([cat]) => visibleGrouped[cat]?.length > 0)
        .map(([categoryName, config]) => (
          <div key={categoryName}>
            {/* Category Header */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm">{config.emoji}</span>
              <span className="text-xs font-black text-secondary-900 dark:text-white uppercase tracking-wider">{categoryName}</span>
              <span className="text-[9px] font-bold text-secondary-400">({visibleGrouped[categoryName].length})</span>
            </div>

            {/* Place Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {visibleGrouped[categoryName].map((pl, idx) => (
                <button
                  key={idx}
                  onClick={() => onPlaceClick?.(pl)}
                  className={`group w-full text-left p-3.5 rounded-2xl border border-secondary-100 dark:border-secondary-800 flex items-center justify-between gap-3 transition-all duration-200 hover:shadow-premium-md hover:border-secondary-200 dark:hover:border-secondary-700 hover:-translate-y-0.5 cursor-pointer bg-white dark:bg-secondary-900`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Colored icon circle */}
                    <div className={`w-11 h-11 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0 ${config.color} transition-transform duration-200 group-hover:scale-110`}>
                      {config.getIcon()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-secondary-400 block font-bold uppercase tracking-wide">{pl.type}</span>
                      <span className="text-xs text-secondary-800 dark:text-white font-extrabold block mt-0.5 truncate max-w-[180px]">{pl.name}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <span className="text-primary-650 bg-primary-50 dark:bg-primary-950/20 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                      {pl.distance}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isWalk(pl.time)
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20'
                        : 'text-blue-600 bg-blue-50 dark:bg-blue-950/20'
                    }`}>
                      {isWalk(pl.time)
                        ? <Footprints className="h-2.5 w-2.5" />
                        : <Car className="h-2.5 w-2.5" />
                      }
                      {pl.time}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

      {/* Expand / Collapse Toggle */}
      {allOrdered.length > INITIAL_COUNT && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-secondary-500 hover:text-secondary-800 dark:hover:text-white transition-colors group"
        >
          <span>{expanded ? 'Show fewer places' : `View all ${allOrdered.length} nearby places`}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''} group-hover:translate-y-0.5`} />
        </button>
      )}
    </div>
  );
};
