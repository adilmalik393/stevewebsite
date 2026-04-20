"use client";

import { publish, unpublish, duplicate } from "../../actions";
import { IconDuplicate, IconPublish, IconUnpublish, iconClass } from "./report-icons";

const iconBtn =
  "inline-flex items-center justify-center rounded-lg p-2 border border-transparent transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/40";

export function PublishButton({
  reportId,
  status,
}: {
  reportId: string;
  status: string;
}) {
  async function handlePublish() {
    const newSlug = await publish(reportId);
    const url = `${window.location.origin}/r/${newSlug}`;
    await navigator.clipboard.writeText(url);
    alert(`Published! Link copied:\n${url}`);
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
        className={`${iconBtn} text-[#A0AEC0] hover:text-white hover:bg-[#252B35]/60 hover:border-[#353B45]`}
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
      className={`${iconBtn} text-[#00FF9D] hover:bg-[#00FF9D]/15 hover:border-[#00FF9D]/25`}
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
      className={`${iconBtn} text-[#A0AEC0] hover:text-white hover:bg-[#252B35]/60 hover:border-[#353B45]`}
      title="Duplicate"
      aria-label="Duplicate"
    >
      <IconDuplicate className={iconClass()} />
    </button>
  );
}
