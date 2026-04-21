import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { LibsqlDialect } from "@libsql/kysely-libsql";

function getBaseURL(): string {
  const betterAuthURL = process.env.BETTER_AUTH_URL?.trim();
  const vercelURL = process.env.VERCEL_URL?.trim();

  // Prefer explicit BETTER_AUTH_URL unless it's localhost in hosted envs.
  if (betterAuthURL) {
    const isLocalhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(
      betterAuthURL
    );

    if (!isLocalhost || !vercelURL) {
      return betterAuthURL.startsWith("http")
        ? betterAuthURL
        : `https://${betterAuthURL}`;
    }
  }

  // Vercel auto-sets VERCEL_URL without protocol.
  if (vercelURL) {
    return `https://${vercelURL}`;
  }

  return "http://localhost:3000";
}

export const auth = betterAuth({
  baseURL: getBaseURL(),
  database: {
    dialect: new LibsqlDialect({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    }),
    type: "sqlite" as const,
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
