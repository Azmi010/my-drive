import { DriveView } from "@/components/drive-view";

export default async function DrivePage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string | string[] }>;
}) {
  const params = await searchParams;
  const folderId = typeof params.folder === "string" ? params.folder : null;

  return <DriveView folderId={folderId} />;
}
