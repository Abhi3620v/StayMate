import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import locationService from '../services/locationService';
import toast from 'react-hot-toast';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  // Geolocation and map states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [radius, setRadius] = useState(null); // radius in meters
  
  // Persistent map view state
  const [mapState, setMapState] = useState(() => {
    const saved = localStorage.getItem('sm_map_state');
    return saved ? JSON.parse(saved) : { zoom: 12, center: { lat: 28.6282, lng: 77.3789 } };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-sync map views states to local storage
  const saveMapState = useCallback((zoom, center) => {
    const newState = { zoom, center };
    setMapState(newState);
    localStorage.setItem('sm_map_state', JSON.stringify(newState));
  }, []);

  /**
   * Request browser geolocator coordinates
   */
  const getCurrentBrowserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Browser geolocation is not supported on this device.');
      return null;
    }

    setLoading(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setCurrentLocation(coords);
          setMapState(prev => ({ ...prev, center: coords }));
          toast.success('Retrieved current location successfully!');
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          console.warn('Geolocation permission denied:', err.message);
          // Fallback Noida sector 62 coordinates silently
          const fallback = { lat: 28.6282, lng: 77.3789 };
          toast.error('Location access denied. Using fallback city center.');
          setLoading(false);
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const res = await locationService.reverseGeocode(lat, lng);
      return res.data;
    } catch (err) {
      console.error('Reverse geocode failure:', err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const geocodeAddress = useCallback(async (address, placeId = null) => {
    setLoading(true);
    try {
      const res = await locationService.geocode(address, placeId);
      return res.data;
    } catch (err) {
      console.error('Geocoding failure:', err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        selectedPlace,
        setSelectedPlace,
        radius,
        setRadius,
        mapState,
        saveMapState,
        loading,
        error,
        getCurrentBrowserLocation,
        reverseGeocode,
        geocodeAddress
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;
