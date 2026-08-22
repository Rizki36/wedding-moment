import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAdminFn } from "../../server/auth/guards";

export const Route = createFileRoute("/_authed/admin")({
  beforeLoad: async () => {
    const session = await requireAdminFn();
    return { session };
  },
  component: () => <Outlet />,
});
