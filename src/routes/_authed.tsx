import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardShell } from "../components/layout/DashboardShell";
import { getSessionOrRedirectFn } from "../server/auth/guards";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async () => {
    const session = await getSessionOrRedirectFn();
    return { session };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { session } = Route.useRouteContext();
  const role = session.user.role === "admin" ? "admin" : "pengantin";
  return (
    <DashboardShell userName={session.user.name} role={role}>
      <Outlet />
    </DashboardShell>
  );
}
