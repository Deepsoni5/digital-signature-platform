import { ActivityLogClient } from "@/components/admin/activity-log-client";

export default function AdminActivityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Activity Logs</h2>
      </div>
      <ActivityLogClient />
    </div>
  );
}
