"use client";

import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "./sign-out-button";

export function ProfileMenu({
  displayName,
  email,
}: {
  displayName: string;
  email?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--hover-bg)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
        aria-label="Open profile menu"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-lg p-3 z-50">
          <div className="pb-2 border-b border-[var(--border)]">
            <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-1">Profile</p>
            <p className="text-sm text-[var(--text-primary)] break-all">{displayName}</p>
            {email && email !== displayName && (
              <p className="text-xs text-[var(--text-secondary)] break-all mt-1">{email}</p>
            )}
          </div>
          <div className="pt-3 flex items-center justify-end">
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}
