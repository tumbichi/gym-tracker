export default function formatDatetime(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
