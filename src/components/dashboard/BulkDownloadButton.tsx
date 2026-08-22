import { primaryButtonVariantClasses } from "../ui/Button";

// Plain `<a>`, not `LinkButton` — this points at an API-served file
// (`/api/download/*.zip`), not a TanStack Router route, so it can't use
// `Link`'s `to` prop. Styled to match the `Button` primitive.
export function BulkDownloadButton({ eventId }: { eventId: string }) {
  return (
    <a
      href={`/api/download/${eventId}.zip`}
      className={`rounded ${primaryButtonVariantClasses} px-6 py-3 inline-block font-medium transition`}
    >
      Unduh Semua
    </a>
  );
}
