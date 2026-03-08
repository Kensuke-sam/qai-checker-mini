export const FlashMessage = ({
  message,
  tone = "neutral",
}: {
  message?: string;
  tone?: "neutral" | "success" | "warning" | "error";
}) => {
  if (!message) {
    return null;
  }

  const toneClasses =
    tone === "success"
      ? "border-success/20 bg-success/10 text-success"
      : tone === "error"
        ? "border-red-200 bg-red-50 text-red-700"
      : tone === "warning"
        ? "border-warning/20 bg-warning/10 text-warning"
        : "border-line bg-card text-foreground";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClasses}`}>
      {message}
    </div>
  );
};
