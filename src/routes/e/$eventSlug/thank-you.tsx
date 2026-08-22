import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "#/components/ui/Badge";
import { LinkButton } from "#/components/ui/Button";

export const Route = createFileRoute("/e/$eventSlug/thank-you")({
  component: ThankYouPage,
});

function ThankYouPage() {
  const { eventSlug } = Route.useParams();

  return (
    <div className="bg-(--color-surface) min-h-screen p-8 text-center flex flex-col items-center gap-4 justify-center">
      <Badge>♥</Badge>
      <h1 className="font-(--font-display) text-3xl text-(--color-on-surface)">
        Terima kasih!
      </h1>
      <p className="text-(--color-on-surface-variant)">
        Ucapan Anda telah tersimpan untuk pengantin.
      </p>
      <LinkButton
        to="/e/$eventSlug"
        params={{ eventSlug }}
        variant="primary"
        className="mt-2"
      >
        Ambil foto lagi
      </LinkButton>
    </div>
  );
}
