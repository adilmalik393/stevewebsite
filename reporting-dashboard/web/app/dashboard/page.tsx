import { auth } from "@/lib/auth";
import { listClients } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";
import { addClient } from "./actions";
import { ClientDashboardSection } from "./client-dashboard-section";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const clients = await listClients(session.user.id);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <header className="border-b border-[#252B35] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-[family-name:var(--font-montserrat)]">
            EDM Signal
          </h1>
          <p className="text-sm text-[#A0AEC0]">Reporting Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#A0AEC0]">
            {session.user.name || session.user.email}
          </span>
          <SignOutButton />
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
          <form action={addClient} className="rounded-xl border border-[#252B35] bg-[#151A22] p-6">
            <h3 className="text-sm font-semibold text-[#A0AEC0] uppercase tracking-wider mb-4">
              Add new client
            </h3>
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
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-[#00E5FF] text-[#0B0F14] font-semibold rounded-lg text-sm hover:bg-[#00CCE5] transition"
            >
              Add client
            </button>
          </form>
        </ClientDashboardSection>
      </main>
    </div>
  );
}
