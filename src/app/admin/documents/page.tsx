import { DocumentManagementClient } from "@/components/admin/document-management-client";

export default function AdminDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
      </div>
      <DocumentManagementClient />
    </div>
  );
}
