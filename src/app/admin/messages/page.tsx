import { ContactManagementClient } from "@/components/admin/contact-management-client";

export default function AdminMessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
      </div>
      <ContactManagementClient />
    </div>
  );
}
