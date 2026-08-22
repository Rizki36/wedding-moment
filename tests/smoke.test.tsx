import "@testing-library/jest-dom/vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Index from "../src/routes/index";

function renderRoute() {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Index,
  });
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: () => null,
  });
  const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/register",
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    registerRoute,
  ]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return render(<RouterProvider router={router} />);
}

describe("home route", () => {
  it("renders the marketing headline and Masuk/Daftar call-to-actions", async () => {
    renderRoute();
    expect(
      await screen.findByRole("heading", { name: /kenangan diabadikan/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /masuk/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /daftar/i })).toBeInTheDocument();
  });
});
