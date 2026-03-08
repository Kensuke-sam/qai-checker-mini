import { EmptyState } from "@/components/empty-state";
import { PlaceCard } from "@/components/place-card";
import { listApprovedPlaces } from "@/lib/queries/public";

export const metadata = {
  title: "勤務先一覧 | Shift Notes",
};

export default async function PlacesPage() {
  const places = await listApprovedPlaces();

  return (
    <div className="space-y-8">
      <section className="section-card px-8 py-10">
        <span className="eyebrow">Places</span>
        <h1 className="heading-display mt-4 text-5xl font-bold">勤務先一覧</h1>
        <p className="mt-4 max-w-3xl leading-8 text-muted">
          すべて管理者承認後に公開されます。投稿内容の真偽を運営が断定するものではありません。
        </p>
      </section>
      {places.length ? (
        <div className="grid gap-6">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="まだ公開中の勤務先はありません"
          description="投稿フォームから新しい勤務先付きの体験談を送ると、承認後にここへ表示されます。"
        />
      )}
    </div>
  );
}
