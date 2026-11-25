import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const LocationContext = createContext({
  locationName: "Sasaram, Rohtas, Bihar",
  setLocationName: () => {},
  coordinates: { lat: 24.95, lon: 84.02 },
  setCoordinates: () => {},
  state: "Bihar",
  country: "India",
  requestCurrentLocation: async () => ({ success: false, locationName: "" }),
  setLocationManually: () => {},
});

export function LocationProvider({ children }) {
  const [locationName, setLocationName] = useState(() => {
    return localStorage.getItem("agri_location_name") || "Sasaram, Rohtas, Bihar";
  });

  const [coordinates, setCoordinates] = useState(() => {
    try {
      const saved = localStorage.getItem("agri_coords");
      return saved ? JSON.parse(saved) : { lat: 24.95, lon: 84.02 };
    } catch {
      return { lat: 24.95, lon: 84.02 };
    }
  });

  useEffect(() => {
    localStorage.setItem("agri_location_name", locationName);
  }, [locationName]);

  useEffect(() => {
    localStorage.setItem("agri_coords", JSON.stringify(coordinates));
  }, [coordinates]);

  const setLocationManually = useCallback((locName, coords) => {
    if (!locName) return;
    setLocationName(locName);
    if (coords && coords.lat && coords.lon) {
      setCoordinates(coords);
    }
  }, []);

  const requestCurrentLocation = useCallback(async (force = false) => {
    if (!navigator.geolocation) {
      return { success: false, error: "Geolocation is not supported by your browser." };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const newCoords = { lat: Number(lat.toFixed(4)), lon: Number(lon.toFixed(4)) };
          setCoordinates(newCoords);

          try {
            // Reverse geocode via free open reverse API or weather endpoint
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            if (res.ok) {
              const data = await res.json();
              const city = data.locality || data.city || data.principalSubdivision || "Field Location";
              const stateName = data.principalSubdivision || "";
              const fullLoc = stateName ? `${city}, ${stateName}` : city;
              setLocationName(fullLoc);
              resolve({ success: true, locationName: fullLoc, coordinates: newCoords });
              return;
            }
          } catch (e) {
            console.warn("Reverse geocode failed, using coordinates", e);
          }

          const fallbackName = `Lat: ${newCoords.lat}, Lon: ${newCoords.lon}`;
          setLocationName(fallbackName);
          resolve({ success: true, locationName: fallbackName, coordinates: newCoords });
        },
        (error) => {
          console.warn("Geolocation permission or timeout:", error.message);
          resolve({ success: false, error: error.message, locationName });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  }, [locationName]);

  return (
    <LocationContext.Provider
      value={{
        locationName,
        setLocationName,
        coordinates,
        setCoordinates,
        state: "Bihar",
        country: "India",
        requestCurrentLocation,
        setLocationManually,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    return {
      locationName: "Sasaram, Rohtas, Bihar",
      setLocationName: () => {},
      coordinates: { lat: 24.95, lon: 84.02 },
      setCoordinates: () => {},
      state: "Bihar",
      country: "India",
      requestCurrentLocation: async () => ({ success: false }),
      setLocationManually: () => {},
    };
  }
  return context;
}
