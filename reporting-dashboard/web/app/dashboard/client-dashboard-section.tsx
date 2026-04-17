"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { removeClient, addClient } from "./actions";

export type ClientListRow = {
  id: string;
  company_name: string;
  ticker: string | null;
  contact_email: string | null;
  report_count: number;
};

type SortMode = "default" | "name-asc" | "name-desc" | "reports-desc";
type ScopeFilter = "all" | "with-ticker" | "with-email";

function AddClientForm() {
  return (
    <form action={addClient} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-[#A0AEC0] mb-1">Company name *</label>
          <input
            name="company_name"
            required
            placeholder="NextPlat Corp"
            className="w-full px-3 py-2 bg-[#0B0F14] border border-[#252B35] rounded-lg text-white text-sm placeholder-[#4A5568] focus:outline-none focus:border-[#00E5FF] transition"
          />
        </div>
        <div>
          <label className="block text-xs text-[#A0AEC0] mb-1">Ticker</label>
          <input
            name="ticker"
            placeholder="NXPL"
            className="w-full px-3 py-2 bg-[#0B0F14] border border-[#252B35] rounded-lg text-white text-sm placeholder-[#4A5568] focus:outline-none focus:border-[#00E5FF] transition"
          />
        </div>
        <div>
          <label className="block text-xs text-[#A0AEC0] mb-1">Contact email</label>
          <input
            name="contact_email"
            type="email"
            placeholder="ir@company.com"
            className="w-full px-3 py-2 bg-[#0B0F14] border border-[#252B35] rounded-lg text-white text-sm placeholder-[#4A5568] focus:outline-none focus:border-[#00E5FF] transition"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-[#00E5FF] text-[#0B0F14] font-semibold rounded-lg text-sm hover:bg-[#00CCE5] transition"
        >
          Add client
        </button>
      </div>
    </form>
  );
}

export function ClientDashboardSection({ clients }: { clients: ClientListRow[] }) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [filterOpen]);

  useEffect(() => {
    if (!addOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAddOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addOpen]);

  const filtered = useMemo(() => {
    let list = [...clients];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const parts = [c.company_name, c.ticker, c.contact_email].filter(Boolean).join(" ").toLowerCase();
        return parts.includes(q);
      });
    }
    if (scope === "with-ticker") list = list.filter((c) => !!c.ticker?.trim());
    if (scope === "with-email") list = list.filter((c) => !!c.contact_email?.trim());

    if (sortMode === "name-asc") {
      list.sort((a, b) => a.company_name.localeCompare(b.company_name, undefined, { sensitivity: "base" }));
    } else if (sortMode === "name-desc") {
      list.sort((a, b) => b.company_name.localeCompare(a.company_name, undefined, { sensitivity: "base" }));
    } else if (sortMode === "reports-desc") {
      list.sort((a, b) => b.report_count - a.report_count);
    }

    return list;
  }, [clients, query, scope, sortMode]);

  const filterActive = scope !== "all" || sortMode !== "default";

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor="client-search" className="sr-only">
            Search clients
          </label>
          <input
            id="client-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, ticker, or email…"
            autoComplete="off"
            className="w-full px-4 py-3 bg-[#151A22] border border-[#252B35] rounded-xl text-white text-sm placeholder-[#4A5568] focus:outline-none focus:border-[#00E5FF] transition"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 justify-end">
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className={`px-4 py-3 rounded-xl text-sm font-medium border transition whitespace-nowrap ${
                filterActive
                  ? "border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10"
                  : "border-[#252B35] text-[#A0AEC0] hover:text-white hover:border-[#353B45] bg-[#151A22]"
              }`}
            >
              Filter
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-[#252B35] bg-[#151A22] p-4 shadow-xl">
                <p className="text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider mb-3">Sort</p>
                <div className="space-y-1 mb-4">
                  {(
                    [
                      ["default", "Default order"],
                      ["name-asc", "Company A → Z"],
                      ["name-desc", "Company Z → A"],
                      ["reports-desc", "Most reports first"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setSortMode(value);
                      }}
                      className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                        sortMode === value ? "bg-[#00E5FF]/15 text-[#00E5FF]" : "text-[#A0AEC0] hover:bg-[#252B35]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-semibold text-[#A0AEC0] uppercase tracking-wider mb-3">Show</p>
                <div className="space-y-1">
                  {(
                    [
                      ["all", "All clients"],
                      ["with-ticker", "Has ticker"],
                      ["with-email", "Has contact email"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setScope(value)}
                      className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                        scope === value ? "bg-[#7B61FF]/20 text-[#7B61FF]" : "text-[#A0AEC0] hover:bg-[#252B35]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSortMode("default");
                    setScope("all");
                    setQuery("");
                    setFilterOpen(false);
                  }}
                  className="mt-4 w-full rounded-lg border border-[#252B35] py-2 text-xs text-[#4A5568] hover:text-white hover:border-[#353B45] transition"
                >
                  Reset all
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="px-4 py-3 rounded-xl text-sm font-semibold bg-[#00E5FF] text-[#0B0F14] hover:bg-[#00CCE5] transition whitespace-nowrap"
          >
            Add client
          </button>
        </div>
      </div>

      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-client-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAddOpen(false);
          }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-[#252B35] bg-[#0B0F14] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <h3 id="add-client-title" className="text-lg font-bold font-[family-name:var(--font-montserrat)]">
                Add new client
              </h3>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="text-[#4A5568] hover:text-white text-xl leading-none px-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <AddClientForm />
          </div>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="rounded-xl border border-[#252B35] bg-[#151A22] p-12 text-center mt-8">
          <p className="text-[#4A5568] text-lg">No clients yet</p>
          <p className="text-[#4A5568] text-sm mt-1 mb-6">Create your first client to start building reports.</p>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="px-5 py-2.5 bg-[#00E5FF] text-[#0B0F14] font-semibold rounded-lg text-sm hover:bg-[#00CCE5] transition"
          >
            Add client
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#252B35] bg-[#151A22] p-12 text-center mt-8">
          <p className="text-[#4A5568] text-lg">No matching clients</p>
          <p className="text-[#4A5568] text-sm mt-1">Try adjusting search or filters.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSortMode("default");
              setScope("all");
            }}
            className="mt-4 text-sm text-[#00E5FF] hover:underline"
          >
            Clear search & filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 mt-8">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="rounded-xl border border-[#252B35] bg-[#151A22] p-5 flex items-center justify-between hover:border-[#353B45] transition"
            >
              <Link href={`/dashboard/clients/${client.id}`} className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-white">{client.company_name}</h3>
                  {client.ticker && (
                    <span className="text-xs px-2 py-0.5 rounded bg-[#252B35] text-[#00E5FF] font-mono">
                      ${client.ticker}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#A0AEC0] mt-1">
                  {client.report_count} report{client.report_count !== 1 ? "s" : ""}
                  {client.contact_email && ` · ${client.contact_email}`}
                </p>
              </Link>
              <form action={removeClient}>
                <input type="hidden" name="clientId" value={client.id} />
                <button
                  type="submit"
                  className="text-xs text-[#4A5568] hover:text-[#FF4D4D] transition ml-4"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
