"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (authError) {
      setError(authError.message || "Registration failed");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F14]">
      <div className="w-full max-w-sm p-8 rounded-xl bg-[#151A22] border border-[#252B35]">
        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-[#A0AEC0] text-sm mb-6">EDM Signal Dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#A0AEC0] mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#0B0F14] border border-[#252B35] rounded-lg text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00E5FF] transition"
              placeholder="Steve"
            />
          </div>
          <div>
            <label className="block text-sm text-[#A0AEC0] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#0B0F14] border border-[#252B35] rounded-lg text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00E5FF] transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-[#A0AEC0] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 bg-[#0B0F14] border border-[#252B35] rounded-lg text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00E5FF] transition"
              placeholder="Min 8 characters"
            />
          </div>

          {error && (
            <p className="text-[#FF4D4D] text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#00E5FF] text-[#0B0F14] font-semibold rounded-lg hover:bg-[#00CCE5] disabled:opacity-50 transition"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-[#A0AEC0] text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-[#00E5FF] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
