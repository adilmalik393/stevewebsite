import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { LibsqlDialect } from "@libsql/kysely-libsql";

function getBaseURL(): string {
  // BETTER_AUTH_URL is the priority — must have https://
  if (process.env.BETTER_AUTH_URL) {
    const url = process.env.BETTER_AUTH_URL;
    return url.startsWith("http") ? url : `https://${url}`;
  }
  // Vercel auto-sets VERCEL_URL without protocol
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
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
