"use client";

import dynamic from "next/dynamic";

import type { PlaceWithCounts } from "@/lib/types";

const PlacesMapCanvas = dynamic(
  () =>
    import("@/components/places-map-canvas").then(
      (module) => module.PlacesMapCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="section-card flex min-h-[520px] items-center justify-center px-8 py-10 text-center">
        <div>
          <p className="heading-display text-3xl font-bold">地図を読み込んでいます</p>
          <p className="mt-3 max-w-xl leading-7 text-muted">
            日本全国の公開済み勤務先を地図へ表示しています。
          </p>
        </div>
      </div>
    ),
  },
);

export const PlacesMap = ({ places }: { places: PlaceWithCounts[] }) => {
  return <PlacesMapCanvas places={places} />;
};
