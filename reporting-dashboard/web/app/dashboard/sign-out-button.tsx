"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-3 py-1.5 text-sm bg-[var(--hover-bg)] text-[var(--text-secondary)] rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition"
    >
      Sign out
    </button>
  );
}
