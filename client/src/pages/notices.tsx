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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Calendar, Clock, Plus, AlertCircle, Info, Star } from "lucide-react";

export default function Notices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const { data: notices = [] } = useQuery<any[]>({
    queryKey: ["/api/notices"],
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
      toast({ title: "Notice published successfully" });
      setIsCreateOpen(false);
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
      expiresAt: formData.get("expiresAt") ? new Date(formData.get("expiresAt") as string) : null,
    };
    createNoticeMutation.mutate(noticeData);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "medium":
        return <Star className="h-4 w-4 text-accent" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "exam":
        return "bg-destructive/10 text-destructive";
      case "academic":
        return "bg-primary/10 text-primary";
      case "event":
        return "bg-secondary/10 text-secondary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredNotices = notices.filter((notice: any) => {
    if (filter === "all") return true;
    if (filter === "priority") return notice.priority === "high";
    return notice.type === filter;
  });

  const canCreateNotice = user?.role === "admin" || user?.role === "teacher";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-testid="notices-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Notice Board
        </h1>
        <p className="text-muted-foreground">
          Stay updated with important announcements and events
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            data-testid="filter-all"
          >
            All
          </Button>
          <Button
            variant={filter === "priority" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("priority")}
            data-testid="filter-priority"
          >
            High Priority
          </Button>
          <Button
            variant={filter === "academic" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("academic")}
            data-testid="filter-academic"
          >
            Academic
          </Button>
          <Button
            variant={filter === "exam" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("exam")}
            data-testid="filter-exam"
          >
            Exams
          </Button>
          <Button
            variant={filter === "event" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("event")}
            data-testid="filter-event"
          >
            Events
          </Button>
        </div>

        {canCreateNotice && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-notice">
                <Plus className="h-4 w-4 mr-2" />
                Create Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]" data-testid="dialog-create-notice">
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
                  <Textarea 
                    id="content" 
                    name="content" 
                    required 
                    rows={4}
                    data-testid="textarea-notice-content" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                  <Input
                    id="expiresAt"
                    name="expiresAt"
                    type="datetime-local"
                    data-testid="input-notice-expires"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="button-submit-notice">
                  Publish Notice
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Notices List */}
        <div className="lg:col-span-2">
          {filteredNotices.length > 0 ? (
            <div className="space-y-4">
              {filteredNotices.map((notice: any, index: number) => (
                <Card 
                  key={notice.id} 
                  className={`shadow-sm ${notice.priority === "high" ? "border-destructive/50" : ""}`}
                  data-testid={`notice-card-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getPriorityIcon(notice.priority)}
                          <h3 className="text-lg font-semibold text-foreground">
                            {notice.title}
                          </h3>
                          <Badge variant={getPriorityVariant(notice.priority)} data-testid={`badge-priority-${index}`}>
                            {notice.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge 
                            className={`text-xs ${getTypeColor(notice.type)}`}
                            data-testid={`badge-type-${index}`}
                          >
                            {notice.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            for {notice.targetAudience.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-foreground mb-4 whitespace-pre-wrap">
                      {notice.content}
                    </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Published: {new Date(notice.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(notice.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}</span>
                        </div>
                      </div>
                      {notice.expiresAt && (
                        <div className="flex items-center space-x-2 text-accent">
                          <span>Expires: {new Date(notice.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {canCreateNotice && (
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm" data-testid={`button-edit-notice-${index}`}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-delete-notice-${index}`}>
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-sm" data-testid="card-no-notices">
              <CardContent className="p-12 text-center">
                <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Notices Found</h3>
                <p className="text-muted-foreground">
                  {filter === "all" 
                    ? "No notices have been published yet."
                    : `No notices match the "${filter}" filter.`}
                </p>
                {canCreateNotice && filter === "all" && (
                  <Button className="mt-4" onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-notice">
                    Publish Your First Notice
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notice Statistics */}
          <Card className="shadow-sm" data-testid="card-notice-stats">
            <CardHeader>
              <CardTitle className="text-lg">Notice Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Total Notices</span>
                  <span className="font-semibold" data-testid="text-total-notices">
                    {notices.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">High Priority</span>
                  <span className="font-semibold text-destructive" data-testid="text-high-priority">
                    {notices.filter((n: any) => n.priority === "high").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">This Week</span>
                  <span className="font-semibold text-primary" data-testid="text-this-week">
                    {notices.filter((n: any) => {
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      return new Date(n.createdAt) >= weekAgo;
                    }).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notice Types */}
          <Card className="shadow-sm" data-testid="card-notice-types">
            <CardHeader>
              <CardTitle className="text-lg">By Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["general", "academic", "exam", "event"].map((type, index) => {
                  const typeNotices = notices.filter((n: any) => n.type === type);
                  
                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between p-2 border border-border rounded-lg"
                      data-testid={`notice-type-${index}`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getTypeColor(type).split(' ')[0]}`}></div>
                        <span className="text-sm font-medium text-foreground capitalize">
                          {type}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {typeNotices.length}
                      </Badge>
                    </div>
                  );
                })}
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
                {notices.slice(0, 3).map((notice: any, index: number) => (
                  <div
                    key={notice.id}
                    className="flex items-start space-x-3"
                    data-testid={`activity-item-${index}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notice.priority === "high" ? "bg-destructive" :
                      notice.priority === "medium" ? "bg-accent" :
                      "bg-primary"
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium line-clamp-1">
                        {notice.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notice.createdAt).toLocaleDateString()} •{" "}
                        {new Date(notice.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {notices.length === 0 && (
                <p className="text-center py-4 text-muted-foreground text-sm">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
