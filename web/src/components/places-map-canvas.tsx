"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import {
  latLngBounds,
  type LatLngBoundsExpression,
  type LatLngTuple,
} from "leaflet";

import { DEFAULT_MAP_CENTER } from "@/lib/constants";
import type { PlaceWithCounts } from "@/lib/types";

const JAPAN_BOUNDS: LatLngBoundsExpression = [
  [20.2, 122.0],
  [46.5, 154.5],
];

const DEFAULT_CENTER: LatLngTuple = [
  DEFAULT_MAP_CENTER.lat,
  DEFAULT_MAP_CENTER.lng,
];

function FitToPlaces({ places }: { places: PlaceWithCounts[] }) {
  const map = useMap();

  useEffect(() => {
    const withCoordinates = places.filter(
      (place): place is PlaceWithCounts & { lat: number; lng: number } =>
        typeof place.lat === "number" && typeof place.lng === "number",
    );

    if (!withCoordinates.length) {
      map.setView(DEFAULT_CENTER, DEFAULT_MAP_CENTER.zoom);
      return;
    }

    const bounds = latLngBounds(
      withCoordinates.map((place) => [place.lat, place.lng] as LatLngTuple),
    );

    map.fitBounds(bounds.pad(0.22), {
      maxZoom: 11,
      animate: false,
    });
  }, [map, places]);

  return null;
}

export const PlacesMapCanvas = ({ places }: { places: PlaceWithCounts[] }) => {
  const withCoordinates = useMemo(
    () =>
      places.filter(
        (place): place is PlaceWithCounts & { lat: number; lng: number } =>
          typeof place.lat === "number" && typeof place.lng === "number",
      ),
    [places],
  );

  return (
    <div className="section-card overflow-hidden">
      <div className="relative">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_MAP_CENTER.zoom}
          zoomControl={false}
          scrollWheelZoom={false}
          minZoom={4}
          maxBounds={JAPAN_BOUNDS}
          className="h-[520px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="topright" />
          <FitToPlaces places={places} />
          {withCoordinates.map((place) => (
            <CircleMarker
              key={place.id}
              center={[place.lat, place.lng]}
              radius={Math.min(12 + place.approved_review_count * 2, 24)}
              pathOptions={{
                color: "#fff7ed",
                weight: 2,
                fillColor: "#b44f2e",
                fillOpacity: 0.88,
              }}
            >
              <Popup minWidth={240}>
                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-[0.2em] text-[#8f3618] uppercase">
                    {place.area_tag}
                  </p>
                  <p className="text-base font-bold text-slate-900">{place.name}</p>
                  <p className="text-sm leading-6 text-slate-600">
                    {place.address || place.nearest_station || "住所確認中"}
                  </p>
                  <p className="text-xs text-slate-500">
                    公開済み体験談 {place.approved_review_count} 件
                  </p>
                  <Link
                    href={`/places/${place.id}`}
                    className="inline-flex text-sm font-semibold text-[#8f3618]"
                  >
                    詳細へ
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        <div className="pointer-events-none absolute left-4 top-4 max-w-xs rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-sm font-semibold text-slate-900">公開中の勤務先マップ</p>
          <p className="mt-1 text-xs leading-6 text-slate-600">
            OpenStreetMap を使って日本全国の勤務先を表示しています。ピンを選ぶと詳細へ移動できます。
          </p>
          {!withCoordinates.length ? (
            <p className="mt-2 text-xs leading-6 text-slate-500">
              まだ座標付きの勤務先がないため、日本全体を表示しています。
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
