import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import { GeocodingControl } from "@maptiler/geocoding-control/react";
import { createMapLibreGlMapController } from "@maptiler/geocoding-control/maplibregl-controller";
import "@maptiler/geocoding-control/style.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { db } from "../firebase.config";
import { collection, getDocs } from "firebase/firestore";

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [API_KEY] = useState("4OjFkG91zRTKmrnLHyBh");
  const [zoom] = useState(10);
  const [mapController, setMapController] = useState();
  const [markersData, setMarkersData] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markerInstances, setMarkerInstances] = useState([]);
  const [placeName, setPlaceName] = useState(""); // Store place name

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
          .setPopup(
            new maplibregl.Popup({ closeButton: false }).setHTML(
              `<div >
                <p>No. of Labourers Required: ${marker.nal}</p>
                <p>Wages: Rs. ${marker.wages}</p>
                <a href='/form?lat=${marker.lat}&lng=${marker.lng}&wages=${marker.wages}&nal=${marker.nal}&ID=${marker.ID}'>
                  Open Form
                </a>
              </div>`
            )
          )
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
        setPlaceName("Unknown Location");
      }
    } catch (error) {
      console.error("Error fetching place name:", error);
      setPlaceName("Error fetching location");
    }
  };

  return (
    <div className="w-full p-3 sm:p-5 flex max-lg:flex-col">
      {/* Map Section */}
      <div className="lg:w-[80%] w-full relative">
        <div className="z-10 fixed p-2 sm:p-10 w-screen">
          <GeocodingControl apiKey={API_KEY} mapController={mapController} />
        </div>
        <div className="lg:h-[80vh] h-[55vh] border-2 border-gray-500 rounded-xl" ref={mapContainer} />
      </div>

      {/* Sidebar Section */}
      <div className="lg:w-[20%] w-[100%] pt-3 sm:p-5 border-l border-gray-400">
        {selectedMarker ? (
          <div className="p-3 bg-gray-200 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">Location Details</h3>
            <p><strong>Coordinates:</strong> {selectedMarker.lat}, {selectedMarker.lng}</p>
            <p><strong>Place:</strong> {placeName || "Loading..."}</p>
            <p><strong>Labourers Required:</strong> {selectedMarker.nal}</p>
            <p><strong>Wages:</strong> Rs. {selectedMarker.wages}</p>
            <a
              href={`/form?lat=${selectedMarker.lat}&lng=${selectedMarker.lng}&wages=${selectedMarker.wages}&nal=${selectedMarker.nal}&ID=${selectedMarker.ID}`}
              className="text-blue-500 hover:underline mt-2 block"
            >
              Open Form
            </a>
          </div>
        ) : (
          <p className="text-gray-500 text-center">Choose a location marker to see details</p>
        )}
      </div>
    </div>
  );
}
