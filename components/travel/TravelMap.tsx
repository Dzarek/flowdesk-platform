"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import type { Trip, TravelStatus } from "@/lib/travel/types";

type Props = {
  trips: Trip[];
  scope: "WORLD" | "POLAND";
  statusFilter: "ALL" | TravelStatus;
  onSelectTrip: (tripId: string) => void;
};

function MapViewport({ scope }: { scope: Props["scope"] }) {
  const map = useMap();

  useEffect(() => {
    if (scope === "POLAND") {
      map.setView([52.0, 19.2], 6);
    } else {
      map.setView([40, 10], 3);
    }
  }, [map, scope]);

  return null;
}

export default function TravelMap({
  trips,
  scope,
  statusFilter,
  onSelectTrip,
}: Props) {
  const places = trips.flatMap((trip) =>
    trip.places
      .filter((place) =>
        scope === "POLAND" ? place.country === "Polska" : true,
      )
      .filter(() =>
        statusFilter === "ALL" ? true : trip.status === statusFilter,
      )
      .map((place) => ({ ...place, trip })),
  );

  return (
    <div className="h-[360px] overflow-hidden rounded-xl sm:h-[440px]">
      <MapContainer
        center={scope === "POLAND" ? [52, 19.2] : [40, 10]}
        zoom={scope === "POLAND" ? 6 : 3}
        scrollWheelZoom
        className="h-full w-full"
      >
        <MapViewport scope={scope} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {places.map(({ trip, ...place }) => (
          <CircleMarker
            key={`${trip.id}-${place.id}`}
            center={[place.latitude, place.longitude]}
            radius={8}
            pathOptions={{
              color: trip.status === "COMPLETED" ? "#19483D" : "#D7A15C",
              fillColor: trip.status === "COMPLETED" ? "#287969" : "#E8BB78",
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-40">
                <strong>{place.name}</strong>
                <p>{place.country}</p>
                <p className="mt-1 text-sm">{trip.title}</p>
                <button
                  type="button"
                  className="mt-2 font-semibold text-emerald-800"
                  onClick={() => onSelectTrip(trip.id)}
                >
                  Otwórz podróż
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
