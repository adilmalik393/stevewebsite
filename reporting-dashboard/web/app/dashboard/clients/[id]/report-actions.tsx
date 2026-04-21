"use client";

import { publish, unpublish, duplicate } from "../../actions";
import { IconDuplicate, IconPublish, IconUnpublish, iconClass } from "./report-icons";

const iconBtn =
  "inline-flex items-center justify-center rounded-lg p-2 border border-transparent transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";

export function PublishButton({
  reportId,
  status,
}: {
  reportId: string;
  status: string;
}) {
  async function copyPublishedLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      alert(`Published! Link copied:\n${url}`);
    } catch {
      window.prompt("Published! Copy link manually:", url);
    }
  }

  async function handlePublish() {
    const newSlug = await publish(reportId);
    const url = `${window.location.origin}/r/${newSlug}`;
    await copyPublishedLink(url);
    window.location.reload();
  }

  async function handleUnpublish() {
    await unpublish(reportId);
    window.location.reload();
  }

  if (status === "published") {
    return (
      <button
        type="button"
        onClick={handleUnpublish}
        className={`${iconBtn} text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:border-[var(--hover-border)]`}
        title="Unpublish"
        aria-label="Unpublish"
      >
        <IconUnpublish className={iconClass()} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePublish}
      className={`${iconBtn} text-[var(--success)] hover:bg-[var(--success-bg)] hover:border-[var(--success)]`}
      title="Publish"
      aria-label="Publish"
    >
      <IconPublish className={iconClass()} />
    </button>
  );
}

export function DuplicateButton({
  reportId,
  clientId,
}: {
  reportId: string;
  clientId: string;
}) {
  return (
    <button
      type="button"
      onClick={() => duplicate(reportId, clientId)}
      className={`${iconBtn} text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:border-[var(--hover-border)]`}
      title="Duplicate"
      aria-label="Duplicate"
    >
      <IconDuplicate className={iconClass()} />
    </button>
  );
}
