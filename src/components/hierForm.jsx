import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import mapboxgl from "mapbox-gl";
import { auth, db } from "../firebase.config";
import { collection, doc, getDoc, addDoc, setDoc } from "firebase/firestore";
import { toast, Toaster } from "react-hot-toast";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoid29ya2VyLWJvb3RoIiwiYSI6ImNsdW1rdTNwczE4cnAya2w1M2YwMnppeHUifQ.bk1WbObVQ6gSEve7O_wBaw"; // Replace with your Mapbox access token

export default function HierForm() {
  const { t, i18n } = useTranslation();
  const [userDetails, setUserDetails] = useState(null);
  const [nal, setNal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [map, setMap] = useState(null);
  const [wages, setWages] = useState(0);
  const [marker, setMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      const docRef = doc(db, "hirer", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
      } else {
        // Handle case if user does not exist in the db
      }
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      setLat(selectedLocation.center[1]);
      setLng(selectedLocation.center[0]);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (!map) return;

    // Create a marker
    const newMarker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([lng, lat])
      .addTo(map);

    // Update lat and lng on marker drag
    newMarker.on("dragend", () => {
      const newLngLat = newMarker.getLngLat();
      setLat(newLngLat.lat);
      setLng(newLngLat.lng);
    });

    // Center the map on the marker
    map.flyTo({ center: [lng, lat], zoom: 12 });

    // Set the marker instance to state
    setMarker(newMarker);

    // Cleanup function to remove the marker when component unmounts
    return () => newMarker.remove();
  }, [map, lat, lng]);

  useEffect(() => {
    // Initialize map when component mounts
    const initializeMap = () => {
      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [lng, lat],
        zoom: 12,
      });

      setMap(map);
    };

    if (!mapboxgl.supported()) {
      console.error("Mapbox GL is not supported in this browser");
    } else {
      initializeMap();
    }
  }, [lat, lng]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?access_token=${mapboxgl.accessToken}`
    );
    const data = await response.json();
    setSearchResults(data.features);
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  };

  const handleAutocomplete = debounce(async () => {
    if (!searchQuery) return;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?access_token=${mapboxgl.accessToken}`
    );
    const data = await response.json();
    setSearchResults(data.features);
  }, 300);

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    setSearchQuery(location.place_name);
    setSearchResults([]);
  };

  const handleHier = async (event) => {
    event.preventDefault();

    setIsLoading(true); // Set loading to true when form is submitted

    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        toast.error(t('login_error'));
        setIsLoading(false); // Stop loading if user is not logged in
        return;
      }

      try {
        // Store location data under "location"
        const locationRef = collection(db, "location");
        const entryDocRef = await addDoc(locationRef, {
          nal: nal,
          lat: lat,
          lng: lng,
          userid: user.uid,
          wages: wages,
          timestamp: new Date().toISOString(),
        });

        // Store hirer history under "hirer_history" using the location ID
        const historyRef = collection(db, "hirer_history", user.uid, "hireForms");
        const historyDocRef = doc(historyRef, entryDocRef.id);
        await setDoc(historyDocRef, {
          nal: nal,
          lat: lat,
          lng: lng,
          wages: wages,
          locationId: entryDocRef.id, // Store the generated location ID
          date: new Date().toISOString(),
        });

        toast.success(t('success_message'));

        // Reset the form data after successful submission
        setNal(0);
        setWages(0);
        setSearchQuery("");
        setLat(0);
        setLng(0);
        setSelectedLocation(null);
      } catch (error) {
        console.error("Error saving hiring data:", error);
        toast.error(t('error_message'));
      } finally {
        setIsLoading(false); // Stop loading when the process is complete
      }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <div className="flex justify-center pt-10">
          <h2 className="text-xl font-semibold">{t('application_form')}</h2>
        </div>
        <form onSubmit={handleHier} className="space-y-4 p-10">
          <div className="flex justify-between space-x-2">
            <div className="w-1/2">
              <label>{t('latitude')}</label>
              <input
                type="number"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="border p-2 w-full"
                required
              />
            </div>
            <div className="w-1/2">
              <label>{t('longitude')}</label>
              <input
                type="number"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="border p-2 w-full"
                required
              />
            </div>
          </div>
          <div>
            <label>{t('labourers_required')}</label>
            <input
              type="number"
              value={nal}
              onChange={(e) => setNal(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <div>
            <label>{t('wages')}</label>
            <input
              type="number"
              value={wages}
              onChange={(e) => setWages(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <div>
            <label>{t('work_location')}</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={handleAutocomplete}
              className="border p-2 w-full"
              placeholder={t('location_placeholder')}
              required
            />
          </div>
          <div>
            <button type="submit" className="bg-blue-500 text-white p-2 w-full">
              {isLoading ? t('submitting_button') : t('submit_button')}
            </button>
          </div>
        </form>
      </div>
      <div id="map" className="h-[500px] col-span-1"></div>
      <Toaster />
    </div>
  );
}
