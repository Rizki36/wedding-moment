import { createFileRoute, Link } from "@tanstack/react-router";
import { LinkButton } from "#/components/ui/Button";
import { listEventsForOwnerFn } from "../../../server/functions/events";

export const Route = createFileRoute("/_authed/admin/pengantin/$id/")({
  loader: async ({ params }) => listEventsForOwnerFn({ data: params.id }),
  component: PengantinDetail,
});

function PengantinDetail() {
  const { id } = Route.useParams();
  const events = Route.useLoaderData();
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-(--font-display) text-2xl text-(--color-on-surface)">
          Acara milik pengantin ini
        </h1>
        <LinkButton to="/admin/pengantin/$id/events/new" params={{ id }}>
          Buat Acara
        </LinkButton>
      </div>
      <ul className="grid gap-2">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              to="/dashboard/events/$eventId"
              params={{ eventId: event.id }}
              className="text-(--color-on-surface)"
            >
              {event.brideName} &amp; {event.groomName}
            </Link>
          </li>
        ))}
      </ul>
      {events.length === 0 && (
        <p className="text-(--color-on-surface-variant)">Belum ada acara.</p>
      )}
    </div>
  );
}
