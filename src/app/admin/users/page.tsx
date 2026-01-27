import { UserManagementClient } from "@/components/admin/user-management-client";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
      </div>
      <UserManagementClient />
    </div>
  );
}
