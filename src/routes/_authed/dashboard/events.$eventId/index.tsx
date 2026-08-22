import { createFileRoute } from "@tanstack/react-router";
import { LinkButton } from "#/components/ui/Button";
import { QrCodeCard } from "../../../../components/dashboard/QrCodeCard";
import { requireEventOwnerFn } from "../../../../server/auth/guards";
import { getEventFn } from "../../../../server/functions/events";

export const Route = createFileRoute("/_authed/dashboard/events/$eventId/")({
  beforeLoad: async ({ params }) => {
    await requireEventOwnerFn({ data: params.eventId });
  },
  loader: async ({ params }) => getEventFn({ data: params.eventId }),
  component: EventOverview,
});

function EventOverview() {
  const event = Route.useLoaderData();
  return (
    <div className="p-8">
      <h1 className="font-(--font-display) text-2xl text-(--color-on-surface)">
        {event?.brideName} &amp; {event?.groomName}
      </h1>
      <p className="text-(--color-on-surface-variant)">
        {event?.eventDate} — {event?.venue}
      </p>
      <LinkButton
        to="/dashboard/events/$eventId/frames"
        params={{ eventId: event?.id ?? "" }}
        variant="outline"
        className="mt-4"
      >
        Kelola Bingkai
      </LinkButton>
      <LinkButton
        to="/dashboard/events/$eventId/submissions"
        params={{ eventId: event?.id ?? "" }}
        variant="outline"
        className="mt-4 ml-2"
      >
        Lihat Ucapan Tamu
      </LinkButton>
      {event && <QrCodeCard eventId={event.id} slug={event.slug} />}
    </div>
  );
}
