import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, BookOpen, Calendar, Megaphone, Plus, Settings } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateNoticeOpen, setIsCreateNoticeOpen] = useState(false);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);

  const { data: notices = [] } = useQuery<any[]>({
    queryKey: ["/api/notices"],
    enabled: !!user,
  });

  const { data: classes = [] } = useQuery<any[]>({
    queryKey: ["/api/classes"],
    enabled: !!user,
  });

  const { data: subjects = [] } = useQuery<any[]>({
    queryKey: ["/api/subjects"],
    enabled: !!user,
  });

  const createNoticeMutation = useMutation({
    mutationFn: async (noticeData: any) => {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(noticeData),
      });
      if (!response.ok) throw new Error("Failed to create notice");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      toast({ title: "Notice created successfully" });
      setIsCreateNoticeOpen(false);
    },
  });

  const handleCreateNotice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const noticeData = {
      title: formData.get("title"),
      content: formData.get("content"),
      type: formData.get("type"),
      priority: formData.get("priority"),
      targetAudience: [formData.get("audience")],
    };
    createNoticeMutation.mutate(noticeData);
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-testid="admin-dashboard">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-welcome">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Manage your educational institution efficiently.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm" data-testid="card-total-users">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold" data-testid="text-user-count">156</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm" data-testid="card-total-subjects">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold" data-testid="text-subject-count">{subjects.length}</p>
                <p className="text-sm text-muted-foreground">Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm" data-testid="card-total-classes">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold" data-testid="text-class-count">{classes.length}</p>
                <p className="text-sm text-muted-foreground">Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm" data-testid="card-total-notices">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Megaphone className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold" data-testid="text-notice-count">{notices.length}</p>
                <p className="text-sm text-muted-foreground">Active Notices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Notices */}
          <Card className="shadow-sm" data-testid="card-recent-notices">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Notices</CardTitle>
              <Dialog open={isCreateNoticeOpen} onOpenChange={setIsCreateNoticeOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-notice">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Notice
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-create-notice">
                  <DialogHeader>
                    <DialogTitle>Create New Notice</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateNotice} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" required data-testid="input-notice-title" />
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea id="content" name="content" required data-testid="textarea-notice-content" />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select name="type" required>
                        <SelectTrigger data-testid="select-notice-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select name="priority" required>
                        <SelectTrigger data-testid="select-notice-priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="audience">Target Audience</Label>
                      <Select name="audience" required>
                        <SelectTrigger data-testid="select-notice-audience">
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="students">Students</SelectItem>
                          <SelectItem value="teachers">Teachers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" data-testid="button-submit-notice">
                      Create Notice
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {notices.length > 0 ? (
                <div className="space-y-3">
                  {notices.slice(0, 5).map((notice: any, index: number) => (
                    <div
                      key={notice.id}
                      className="flex items-start justify-between p-3 border border-border rounded-lg"
                      data-testid={`notice-item-${index}`}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{notice.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            notice.priority === "high" ? "bg-destructive/10 text-destructive" :
                            notice.priority === "medium" ? "bg-accent/10 text-accent" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {notice.priority}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notice.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notices published yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Class Schedule Management */}
          <Card className="shadow-sm" data-testid="card-class-schedule">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Class Schedule Management</CardTitle>
              <Button variant="outline" data-testid="button-manage-timetable">
                <Settings className="h-4 w-4 mr-2" />
                Manage Timetable
              </Button>
            </CardHeader>
            <CardContent>
              {classes.length > 0 ? (
                <div className="space-y-3">
                  {classes.slice(0, 5).map((cls: any, index: number) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                      data-testid={`class-item-${index}`}
                    >
                      <div>
                        <h4 className="font-medium text-foreground">
                          {cls.subject?.name || "Unknown Subject"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][cls.dayOfWeek]} • {cls.startTime} - {cls.endTime}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Room {cls.room}, {cls.building}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" data-testid={`button-edit-class-${index}`}>
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No classes scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-sm" data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" data-testid="button-manage-users">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button className="w-full justify-start" variant="outline" data-testid="button-manage-subjects">
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Subjects
              </Button>
              <Button className="w-full justify-start" variant="outline" data-testid="button-view-reports">
                <Settings className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="shadow-sm" data-testid="card-system-status">
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm text-secondary">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">AI Assistant</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm text-secondary">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">QR System</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm text-secondary">Operational</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-sm" data-testid="card-recent-activity">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3" data-testid="activity-item-0">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">New user registration</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3" data-testid="activity-item-1">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">Timetable updated</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3" data-testid="activity-item-2">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">Notice published</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
