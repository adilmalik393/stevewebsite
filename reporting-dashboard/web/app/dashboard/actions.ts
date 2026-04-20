"use server";

import { auth } from "@/lib/auth";
import {
  createClient,
  deleteClient,
  createReport,
  updateReport,
  publishReport,
  unpublishReport,
  duplicateReport,
  deleteReport,
} from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user;
}

// --- Client actions ---

export async function addClient(formData: FormData) {
  const user = await getUser();
  const company_name = formData.get("company_name") as string;
  const ticker = formData.get("ticker") as string;
  const contact_email = formData.get("contact_email") as string;

  if (!company_name?.trim()) throw new Error("Company name is required");

  await createClient(user.id, {
    company_name: company_name.trim(),
    ticker: ticker?.trim() || undefined,
    contact_email: contact_email?.trim() || undefined,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function removeClient(formData: FormData) {
  await getUser();
  const clientId = formData.get("clientId") as string;
  await deleteClient(clientId);
  revalidatePath("/dashboard");
}

// --- Report actions ---

export async function addReport(formData: FormData) {
  await getUser();
  const clientId = formData.get("clientId") as string;
  const campaign_name = formData.get("campaign_name") as string;
  const campaign_start = formData.get("campaign_start") as string;
  const campaign_end = formData.get("campaign_end") as string;

  if (!campaign_name?.trim()) throw new Error("Campaign name is required");

  const report = await createReport(clientId, {
    campaign_name: campaign_name.trim(),
    campaign_start: campaign_start || undefined,
    campaign_end: campaign_end || undefined,
  });

  redirect(`/dashboard/clients/${clientId}/reports/${report.id}`);
}

export async function saveReportPayload(reportId: string, payload: string) {
  await getUser();
  await updateReport(reportId, { payload });
  revalidatePath(`/dashboard`);
}

export async function saveReportMeta(
  reportId: string,
  data: { campaign_name: string; campaign_start: string; campaign_end: string }
) {
  await getUser();
  await updateReport(reportId, data);
  revalidatePath(`/dashboard`);
}

export async function publish(reportId: string) {
  await getUser();
  const slug = await publishReport(reportId);
  revalidatePath(`/dashboard`);
  return slug;
}

export async function unpublish(reportId: string) {
  await getUser();
  await unpublishReport(reportId);
  revalidatePath(`/dashboard`);
}

export async function duplicate(reportId: string, clientId: string) {
  await getUser();
  const newReport = await duplicateReport(reportId);
  revalidatePath(`/dashboard`);
  redirect(`/dashboard/clients/${clientId}/reports/${newReport.id}`);
}

export async function removeReport(formData: FormData) {
  await getUser();
  const reportId = formData.get("reportId") as string;
  const clientId = formData.get("clientId") as string;
  await deleteReport(reportId);
  revalidatePath(`/dashboard`);
  redirect(`/dashboard/clients/${clientId}`);
}
