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
      className="px-3 py-1.5 text-sm bg-[#252B35] text-[#A0AEC0] rounded-lg hover:text-white hover:bg-[#353B45] transition"
    >
      Sign out
    </button>
  );
}
