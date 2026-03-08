import { PlacesMap } from "@/components/places-map";
import { listApprovedPlaces } from "@/lib/queries/public";

export const metadata = {
  title: "地図で探す | Shift Notes",
};

export default async function MapPage() {
  const places = await listApprovedPlaces();

  return (
    <div className="space-y-8">
      <section className="section-card px-8 py-10">
        <span className="eyebrow">Map</span>
        <h1 className="heading-display mt-4 text-5xl font-bold">地図で勤務先を探す</h1>
        <p className="mt-4 max-w-3xl leading-8 text-muted">
          日本全国の公開済み勤務先だけを表示します。新規勤務先の投稿は掲載前に管理者が確認します。
        </p>
      </section>
      <PlacesMap places={places} />
    </div>
  );
}
