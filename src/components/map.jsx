import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import { GeocodingControl } from "@maptiler/geocoding-control/react";
import { createMapLibreGlMapController } from "@maptiler/geocoding-control/maplibregl-controller";
import "@maptiler/geocoding-control/style.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { db } from "../firebase.config";
import { collection, getDocs } from "firebase/firestore";
import { useTranslation } from "react-i18next"; // Importing the translation hook

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [API_KEY] = useState("bAHHjgBgNLq5OCzCiEtk");
  const [zoom] = useState(10);
  const [mapController, setMapController] = useState();
  const [markersData, setMarkersData] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markerInstances, setMarkerInstances] = useState([]);
  const [placeName, setPlaceName] = useState(""); // Store place name
  const { t } = useTranslation(); // Hook for language translation

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
      center: [76.5213, 31.6862], // Default center
      zoom: zoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    setMapController(createMapLibreGlMapController(map.current, maplibregl));

    fetchLocationsAndDisplayMarkers();
  }, [API_KEY, zoom]);

  const fetchLocationsAndDisplayMarkers = async () => {
    try {
      const colRef = collection(db, "location");
      const snapshot = await getDocs(colRef);

      const locations = snapshot.docs.map((doc) => ({
        ID: doc.id,
        lat: doc.data().lat,
        lng: doc.data().lng,
        nal: doc.data().nal,
        wages: doc.data().wages,
      }));

      setMarkersData(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  useEffect(() => {
    displayMarkers();
  }, [markersData, selectedMarker]);

  const displayMarkers = () => {
    markerInstances.forEach((marker) => marker.remove());
    setMarkerInstances([]);

    const newMarkers = markersData.map((marker) => {
      if (marker.nal > 0) {
        const isSelected = selectedMarker?.ID === marker.ID;
        const newMarker = new maplibregl.Marker({
          color: isSelected ? "red" : "blue",
        })
          .setLngLat([marker.lng, marker.lat])
          // .setPopup(
          //   new maplibregl.Popup({ closeButton: false }).setHTML(
          //     `<div >
          //       <p>${t("Labourers Required")}: ${marker.nal}</p>
          //       <p>${t("Wages")}: Rs. ${marker.wages}</p>
          //       <a href='/form?lat=${marker.lat}&lng=${marker.lng}&wages=${marker.wages}&nal=${marker.nal}&ID=${marker.ID}'>
          //         ${t("Open Form")}
          //       </a>
          //     </div>`
          //   )
          // )
          .addTo(map.current)
          .getElement()
          .addEventListener("click", () => handleMarkerSelect(marker));

        return newMarker;
      }
      return null;
    });

    setMarkerInstances(newMarkers.filter(Boolean));
  };

  const handleMarkerSelect = async (marker) => {
    console.log("Marker clicked:", marker); // Debugging log
    setSelectedMarker(marker);
    fetchPlaceName(marker.lat, marker.lng);
  };

  const fetchPlaceName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${API_KEY}`
      );
      const data = await response.json();
      if (data && data.features.length > 0) {
        setPlaceName(data.features[0].place_name); // Get detailed place name
      } else {
        setPlaceName(t("error_fetching_location"));
      }
    } catch (error) {
      console.error("Error fetching place name:", error);
      setPlaceName(t("error_fetching_location"));
    }
  };

  return (
    <div className="w-full p-3 sm:p-5 flex max-lg:flex-col">
      {/* Map Section */}
      <div
        className={` relative ${selectedMarker ? "lg:w-[80%] w-full" : "w-full"}`}
      >
        <div className="z-10 fixed p-2 sm:p-10 w-screen">
          <GeocodingControl apiKey={API_KEY} mapController={mapController} />
        </div>
        <div
          className="lg:h-[79vh] h-[55vh] border-2 border-gray-500 rounded-xl"
          ref={mapContainer}
        />
      </div>

      {/* Sidebar Section */}
      {selectedMarker ? (
        <div className="lg:w-[20%] w-[100%] pt-3 sm:p-5 border-l border-gray-400">
          <div className="p-3 bg-gray-200 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-2 text-center">
              {t("Location")}
            </h3>
            <p>
              <strong>{t("Coordinates")}:</strong> {selectedMarker.lat},{" "}
              {selectedMarker.lng}
            </p>
            <p>
              <strong>{t("Place")}:</strong> {placeName || t("Loading...")}
            </p>
            <p>
              <strong>{t("Labourers Required")}:</strong> {selectedMarker.nal}
            </p>
            <p>
              <strong>{t("Wages")}:</strong> Rs. {selectedMarker.wages}
            </p>
            <a
              href={`/form?lat=${selectedMarker.lat}&lng=${selectedMarker.lng}&wages=${selectedMarker.wages}&nal=${selectedMarker.nal}&ID=${selectedMarker.ID}`}
              className="text-blue-500 hover:underline mt-2 block"
            >
              {t("Open Form")}
            </a>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
