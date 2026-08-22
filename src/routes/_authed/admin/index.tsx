import { createFileRoute, Link } from "@tanstack/react-router";
import { LinkButton } from "#/components/ui/Button";
import { cardClasses } from "#/components/ui/Card";
import { listPengantinFn } from "../../../server/functions/users";

export const Route = createFileRoute("/_authed/admin/")({
  loader: async () => listPengantinFn(),
  component: AdminHome,
});

function AdminHome() {
  const pengantinList = Route.useLoaderData();
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-(--font-display) text-3xl text-(--color-on-surface)">
          Akun Pengantin
        </h1>
        <LinkButton to="/admin/pengantin/new">Buat Akun</LinkButton>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pengantinList.map((p) => (
          <li key={p.id}>
            <Link
              to="/admin/pengantin/$id"
              params={{ id: p.id }}
              className={`block ${cardClasses} p-4 text-(--color-on-surface) hover:shadow-[0_4px_20px_rgba(45,71,57,0.1)] transition-shadow`}
            >
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-(--color-on-surface-variant)">
                @{p.username}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {pengantinList.length === 0 && (
        <p className="text-(--color-on-surface-variant)">
          Belum ada akun pengantin.
        </p>
      )}
    </div>
  );
}
