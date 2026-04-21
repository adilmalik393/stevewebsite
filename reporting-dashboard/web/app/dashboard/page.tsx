import { auth } from "@/lib/auth";
import { listClients } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { addClient } from "./actions";
import { ClientDashboardSection } from "./client-dashboard-section";
import { ProfileMenu } from "./profile-menu";
import { ThemeToggle } from "./theme-toggle";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const clients = await listClients(session.user.id);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-[family-name:var(--font-montserrat)]">
            EDM Signal
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Reporting Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ProfileMenu
            displayName={session.user.name || session.user.email}
            email={session.user.email}
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Clients</h2>
        </div>

        <ClientDashboardSection
          clients={clients.map((c) => ({
            id: c.id,
            company_name: c.company_name,
            ticker: c.ticker,
            contact_email: c.contact_email,
            report_count: c.report_count,
          }))}
        >
          {/* Add Client Form — search bar is rendered above this by ClientDashboardSection */}
          <form action={addClient} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Add new client
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Company name *</label>
                <input
                  name="company_name"
                  required
                  placeholder="NextPlat Corp"
                  className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)] transition"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Ticker</label>
                <input
                  name="ticker"
                  placeholder="NXPL"
                  className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)] transition"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">Contact email</label>
                <input
                  name="contact_email"
                  type="email"
                  placeholder="ir@company.com"
                  className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)] transition"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-[var(--accent)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--accent-hover)] transition"
            >
              Add client
            </button>
          </form>
        </ClientDashboardSection>
      </main>
    </div>
  );
}
