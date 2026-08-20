import { LogoutButton } from "@/components/logout-button";

export default function DrivePage() {
  return (
    <div className="flex flex-1 flex-col p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Drive</h1>
        <LogoutButton />
      </div>
      <p className="text-zinc-500">Phase 3 done. Login works. File module next.</p>
    </div>
  );
}
