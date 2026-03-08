export const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="rounded-[24px] border border-dashed border-line bg-card/70 px-6 py-12 text-center">
    <p className="heading-display text-2xl font-bold">{title}</p>
    <p className="mx-auto mt-3 max-w-xl leading-7 text-muted">{description}</p>
  </div>
);
