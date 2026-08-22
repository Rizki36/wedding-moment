import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { CoverImageUploadForm } from "#/components/dashboard/CoverImageUploadForm";
import { Button } from "#/components/ui/Button";
import { requireEventOwnerFn } from "../../../../server/auth/guards";
import { getEventFn, updateEventFn } from "../../../../server/functions/events";

export const Route = createFileRoute(
  "/_authed/dashboard/events/$eventId/settings",
)({
  beforeLoad: async ({ params }) => {
    await requireEventOwnerFn({ data: params.eventId });
  },
  loader: async ({ params }) => getEventFn({ data: params.eventId }),
  component: EventSettings,
});

function EventSettings() {
  const event = Route.useLoaderData();
  const router = useRouter();
  const [venue, setVenue] = useState(event?.venue ?? "");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    await updateEventFn({ data: { eventId: event.id, venue } });
    setSaved(true);
  }

  return (
    <div className="p-8 max-w-md flex flex-col gap-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-on-surface)">
        Pengaturan Acara
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="Lokasi"
          className="border-b-2 border-(--color-outline-variant) bg-(--color-surface-container-low) rounded px-3 py-2 text-(--color-on-surface) focus:border-(--color-primary) focus:outline-none transition-colors"
        />
        {saved && (
          <p className="text-sm text-(--color-on-surface-variant)">
            Tersimpan.
          </p>
        )}
        <Button type="submit">Simpan</Button>
      </form>
      {event && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg text-(--color-on-surface)">
            Gambar Sampul
          </h2>
          <p className="text-sm text-(--color-on-surface-variant)">
            Ditampilkan di atas formulir nama tamu (rasio 1:1).
          </p>
          <CoverImageUploadForm
            eventId={event.id}
            currentUrl={event.coverImageKey ?? null}
            onUploaded={() => router.invalidate()}
          />
        </div>
      )}
    </div>
  );
}
