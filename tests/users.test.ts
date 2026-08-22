import "dotenv/config";
import { describe, expect, it } from "vitest";
import { auth } from "../src/server/auth/auth";
import { requireAdmin } from "../src/server/auth/guards";
import { toPlaceholderEmail } from "../src/server/auth/placeholder-email";
import {
  createPengantinAccount,
  listPengantin,
} from "../src/server/functions/users";

async function signUpAndGetHeaders(name: string, username: string) {
  const { headers, response } = await auth.api.signUpEmail({
    body: {
      name,
      email: toPlaceholderEmail(username),
      username,
      password: "password123",
    },
    returnHeaders: true,
  });
  const setCookie = headers.get("set-cookie");
  if (!setCookie) throw new Error("sign up did not return a session cookie");
  const cookie = setCookie
    .split(",")
    .map((part) => part.split(";")[0].trim())
    .join("; ");
  return { headers: new Headers({ cookie }), userId: response.user.id };
}

describe("createPengantinAccount", () => {
  it("creates a user with role pengantin and a usable password", async () => {
    const username = `pengantin-test-${Date.now()}`;
    const user = await createPengantinAccount({
      name: "Test Pengantin",
      username,
      password: "temporary123",
    });
    expect(user.role).toBe("pengantin");

    const list = await listPengantin();
    expect(list.some((u) => u.username === username)).toBe(true);
  });
});

/**
 * `createPengantinAccountFn` (src/server/functions/users.ts) is a
 * `createServerFn`-wrapped RPC endpoint, reachable over the network
 * independent of any route's `beforeLoad`. As established in
 * tests/events.test.ts, calling a `createServerFn`-wrapped function
 * directly in Vitest isn't possible outside a real Start request context
 * (it throws "No Start context found in AsyncLocalStorage"), so what's
 * tested here is the exact guard the handler calls before creating any
 * account: `requireAdmin`, which must reject both an unauthenticated
 * caller and an authenticated non-admin (e.g. a pengantin) caller.
 */
describe("createPengantinAccountFn security: admin required", () => {
  it("requireAdmin rejects a request with no session (unauthenticated RPC call)", async () => {
    await expect(requireAdmin(new Headers())).rejects.toBeDefined();
  });

  it("requireAdmin rejects a real, authenticated non-admin (a plain pengantin)", async () => {
    const pengantin = await signUpAndGetHeaders(
      "Not Admin",
      `not-admin-test-${Date.now()}`,
    );
    await expect(requireAdmin(pengantin.headers)).rejects.toBeDefined();
  });
});
