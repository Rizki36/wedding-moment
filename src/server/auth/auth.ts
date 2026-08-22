import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "../db/client";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 32,
      usernameValidator: (value) => /^[a-zA-Z0-9_.-]+$/.test(value),
    }),
  ],
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "pengantin" },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
});
