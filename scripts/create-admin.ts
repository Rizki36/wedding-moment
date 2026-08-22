import "dotenv/config";
import { eq } from "drizzle-orm";
import { auth } from "../src/server/auth/auth";
import { toPlaceholderEmail } from "../src/server/auth/placeholder-email";
import { db } from "../src/server/db/client";
import { user } from "../src/server/db/schema";

async function main() {
  const [username, password, name] = process.argv.slice(2);
  if (!username || !password) {
    console.error(
      "Usage: pnpm exec tsx scripts/create-admin.ts <username> <password> [name]",
    );
    process.exit(1);
  }

  const result = await auth.api.signUpEmail({
    body: {
      name: name ?? username,
      email: toPlaceholderEmail(username),
      username,
      displayUsername: username,
      password,
    },
  });

  await db.update(user).set({ role: "admin" }).where(eq(user.id, result.user.id));

  console.log(`Admin account created: ${username} (id: ${result.user.id})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
