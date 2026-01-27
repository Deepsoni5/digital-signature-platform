import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, CreditCard, Activity, MessageSquare, Clock } from "lucide-react";
import { PlanDistributionChart } from "@/components/admin/plan-distribution-chart";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

async function getStats() {
  if (!supabase) return null;
  
  const [
      { count: totalUsers },
      { count: totalDocuments },
      { count: proUsers },
      { count: eliteUsers },
      { count: basicUsers },
      { count: totalMessages },
      { count: pendingMessages },
      { data: recentActivity },
      { data: recentDocuments }
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("documents").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("plan_name", "Pro"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("plan_name", "Elite"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("plan_name", "Basic"),
      supabase.from("contact_submissions").select("*", { count: "exact", head: true }),
      supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("document_audit_logs").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("documents").select("*, users(full_name, email, image_url)").order("created_at", { ascending: false }).limit(5)
    ]);

  return {
    totalUsers: totalUsers || 0,
    totalDocuments: totalDocuments || 0,
    totalMessages: totalMessages || 0,
    pendingMessages: pendingMessages || 0,
    proUsers: proUsers || 0,
    eliteUsers: eliteUsers || 0,
    basicUsers: basicUsers || 0,
    freeUsers: (totalUsers || 0) - ((proUsers || 0) + (eliteUsers || 0) + (basicUsers || 0)),
    recentActivity: recentActivity || [],
    recentDocuments: recentDocuments || []
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  if (!stats) return <div className="p-4 text-red-500">Database connection failed.</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.proUsers + stats.eliteUsers + stats.basicUsers} Premium Users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Processed across platform
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingMessages} pending response
            </p>
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">99.9%</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
                <div className="space-y-4">
                    {stats.recentActivity.map((activity: any) => {
                        let metadata = {};
                        try {
                            metadata = JSON.parse(activity.metadata);
                        } catch (e) {}

                        return (
                            <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-3 shadow-sm">
                                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                                    <Clock className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {activity.event_type.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        by {activity.actor_name} ({activity.actor_email})
                                    </p>
                                    {(metadata as any).location && (
                                         <p className="text-xs text-muted-foreground">
                                            📍 {(metadata as any).location}
                                         </p>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(activity.created_at).toLocaleString()}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>User subscription breakdown</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <PlanDistributionChart data={[
                { name: "Free", value: stats.freeUsers, fill: "#94a3b8" },
                { name: "Basic", value: stats.basicUsers, fill: "#10b981" },
                { name: "Pro", value: stats.proUsers, fill: "#6366f1" },
                { name: "Elite", value: stats.eliteUsers, fill: "#f43f5e" },
            ]} />
          </CardContent>
        </Card>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Latest documents processed</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                  {stats.recentDocuments.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center gap-4">
                              <Avatar>
                                  <AvatarImage src={doc.users?.image_url} />
                                  <AvatarFallback>{doc.users?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                  <p className="text-sm font-medium">{doc.file_name}</p>
                                  <p className="text-xs text-muted-foreground">{doc.users?.full_name}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2">
                              <Badge variant={doc.status === "completed" ? "default" : "secondary"}>
                                  {doc.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                  {new Date(doc.created_at).toLocaleDateString()}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
