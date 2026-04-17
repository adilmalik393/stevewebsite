"use client";

import { publish, unpublish, duplicate } from "../../actions";

export function PublishButton({
  reportId,
  status,
  slug,
}: {
  reportId: string;
  status: string;
  slug: string | null;
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
        onClick={handleUnpublish}
        className="text-xs text-[#A0AEC0] hover:text-white transition"
      >
        Unpublish
      </button>
    );
  }

  return (
    <button
      onClick={handlePublish}
      className="text-xs px-2 py-1 bg-[#00FF9D]/10 text-[#00FF9D] rounded hover:bg-[#00FF9D]/20 transition"
    >
      Publish
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
      onClick={() => duplicate(reportId, clientId)}
      className="text-xs text-[#A0AEC0] hover:text-white transition"
    >
      Duplicate
    </button>
  );
}
