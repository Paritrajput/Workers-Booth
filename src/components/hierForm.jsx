import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { auth, db } from "../firebase.config";
import { collection, doc, getDoc, setDoc, addDoc } from "firebase/firestore"; // Fix import
import { toast, Toaster } from "react-hot-toast";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoid29ya2VyLWJvb3RoIiwiYSI6ImNsdW1rdTNwczE4cnAya2w1M2YwMnppeHUifQ.bk1WbObVQ6gSEve7O_wBaw"; // Replace with your Mapbox access token

export default function HierForm() {
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
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      const docRef = doc(db, "hirer", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
      } else {
        console.error("No user data found");
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

    // Cleanup existing marker
    if (marker) marker.remove();

    // Create a new marker
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
    const initializeMap = () => {
      const mapInstance = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [lng, lat],
        zoom: 12,
      });

      setMap(mapInstance);
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
    setIsLoading(true); // Start loading

    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        toast.error('Please log in');
        setIsLoading(false); // Stop loading if user is not logged in
        return;
      }

      try {
        const nalNum = parseInt(nal, 10); // Ensure nal is a number

        // Store location data under "location"
        const locationRef = collection(db, "location");
        const entryDocRef = await addDoc(locationRef, {
          nal: nalNum,
          lat: lat,
          lng: lng,
          loction:searchQuery,
          userid: user.uid,
          wages: wages,
          timestamp: new Date().toISOString(),
        });

        // Store hirer history under "hirer_history" using the location ID
        const historyRef = collection(db, "hirer_history", user.uid, "hireForms");
        const historyDocRef = doc(historyRef, entryDocRef.id);
        await setDoc(historyDocRef, {
          nal: nalNum,
          lat: lat,
          lng: lng,
          wages: wages,
          locationId: entryDocRef.id, // Store the generated location ID
          date: new Date().toISOString(),
        });

        toast.success('Application submitted successfully');
        setIsLoading(false); // Stop loading

        // Reset form data after successful submission
        setNal(0);
        setWages(0);
        setSearchQuery("");
        setLat(0);
        setLng(0);
        setSelectedLocation(null);
      } catch (error) {
        console.error("Error saving hiring data:", error);
        toast.error('An error occurred while submitting the form');
        setIsLoading(false); // Stop loading in case of error
      }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <div className="flex justify-center pt-24">
          <div className="flex flex-col w-[40vw] p-3 bg-white rounded-md relative">
            <Toaster
              toastOptions={{ duration: 4000 }}
              position="bottom-center"
              reverseOrder={false}
            />
            <form onSubmit={handleHier}>
              <h2 className="text-2xl text-center font-bold mb-6">
                Application Form for Hirer
              </h2>
              <div className="mb-3 flex gap-4">
                <div className="mb-3">
                  <label>Latitude</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-gray-500"
                    placeholder="Latitude"
                    value={lat}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label>Longitude</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-gray-500"
                    placeholder="Longitude"
                    value={lng}
                    disabled
                  />
                </div>
              </div>
              <div className="mb-3 flex gap-4">
                <div className="mb-3">
                  <label>No. of labourers required</label>
                  <input
                    type="number" // Change to number input type
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-gray-500"
                    placeholder="Enter labourers required"
                    value={nal}
                    onChange={(e) => setNal(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label>Wages</label>
                  <input
                    type="number" // Change to number input type
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-gray-500"
                    placeholder="Amount"
                    value={wages}
                    onChange={(e) => setWages(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-3 relative">
                <label>Work Location</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-gray-500"
                  placeholder="Location"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleAutocomplete();
                  }}
                />
                <div className="autocomplete rounded-md absolute top-full left-0 w-full bg-white border border-gray-300 shadow-md z-10">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleSelectLocation(result)}
                      className="autocomplete-item p-2 cursor-pointer hover:bg-gray-100"
                    >
                      {result.place_name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute w-[40vw] pr-6">
                <button
                  type="submit"
                  className="w-full bg-gray-500 text-white rounded-md px-2 py-2 hover:bg-gray-600 transition duration-300"
                  disabled={isLoading} // Disable button when loading
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div>
        <div
          id="map"
          className="h-[70vh] m-10 rounded-lg border border-solid border-black"
        ></div>
      </div>
    </div>
  );
}
