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
import { BookOpen, Calendar, Clock, Plus, FileText, Upload } from "lucide-react";

export default function Assignments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const { data: assignments = [] } = useQuery<any[]>({
    queryKey: ["/api/assignments"],
    enabled: !!user,
  });

  const { data: subjects = [] } = useQuery<any[]>({
    queryKey: ["/api/subjects"],
    enabled: !!user,
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(assignmentData),
      });
      if (!response.ok) throw new Error("Failed to create assignment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({ title: "Assignment created successfully" });
      setIsCreateOpen(false);
    },
  });

  const handleCreateAssignment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const assignmentData = {
      title: formData.get("title"),
      description: formData.get("description"),
      subjectId: formData.get("subjectId"),
      dueDate: new Date(formData.get("dueDate") as string),
      maxMarks: parseInt(formData.get("maxMarks") as string),
    };
    createAssignmentMutation.mutate(assignmentData);
  };

  const getAssignmentStatus = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return { status: "overdue", label: "Overdue", variant: "destructive" as const };
    if (daysDiff === 0) return { status: "due-today", label: "Due Today", variant: "destructive" as const };
    if (daysDiff <= 3) return { status: "due-soon", label: "Due Soon", variant: "default" as const };
    return { status: "upcoming", label: "Upcoming", variant: "secondary" as const };
  };

  const filteredAssignments = assignments.filter((assignment: any) => {
    if (filter === "all") return true;
    const { status } = getAssignmentStatus(assignment.dueDate);
    return status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-testid="assignments-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Assignments
        </h1>
        <p className="text-muted-foreground">
          {user?.role === "teacher" ? "Manage and track student assignments" : "View and submit your assignments"}
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
            variant={filter === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("upcoming")}
            data-testid="filter-upcoming"
          >
            Upcoming
          </Button>
          <Button
            variant={filter === "due-soon" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("due-soon")}
            data-testid="filter-due-soon"
          >
            Due Soon
          </Button>
          <Button
            variant={filter === "overdue" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("overdue")}
            data-testid="filter-overdue"
          >
            Overdue
          </Button>
        </div>

        {user?.role === "teacher" && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-assignment">
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]" data-testid="dialog-create-assignment">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required data-testid="input-assignment-title" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" data-testid="textarea-assignment-description" />
                </div>
                <div>
                  <Label htmlFor="subjectId">Subject</Label>
                  <Select name="subjectId" required>
                    <SelectTrigger data-testid="select-assignment-subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="datetime-local"
                    required
                    data-testid="input-assignment-due-date"
                  />
                </div>
                <div>
                  <Label htmlFor="maxMarks">Maximum Marks</Label>
                  <Input
                    id="maxMarks"
                    name="maxMarks"
                    type="number"
                    min="1"
                    data-testid="input-assignment-max-marks"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="button-submit-assignment">
                  Create Assignment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Assignments List */}
        <div className="lg:col-span-2">
          {filteredAssignments.length > 0 ? (
            <div className="space-y-4">
              {filteredAssignments.map((assignment: any, index: number) => {
                const { status, label, variant } = getAssignmentStatus(assignment.dueDate);
                
                return (
                  <Card key={assignment.id} className="shadow-sm" data-testid={`assignment-card-${index}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {assignment.title}
                            </h3>
                            <Badge variant={variant} data-testid={`badge-status-${index}`}>
                              {label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {assignment.subject?.name || "Unknown Subject"}
                          </p>
                          {assignment.description && (
                            <p className="text-sm text-foreground mb-3">
                              {assignment.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(assignment.dueDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}</span>
                        </div>
                        {assignment.maxMarks && (
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Max: {assignment.maxMarks} marks</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {user?.role === "student" && (
                          <>
                            <Button size="sm" data-testid={`button-submit-${index}`}>
                              <Upload className="h-4 w-4 mr-2" />
                              Submit Assignment
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-view-details-${index}`}>
                              View Details
                            </Button>
                          </>
                        )}
                        {user?.role === "teacher" && (
                          <>
                            <Button size="sm" data-testid={`button-view-submissions-${index}`}>
                              View Submissions
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-edit-assignment-${index}`}>
                              Edit
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="shadow-sm" data-testid="card-no-assignments">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Assignments Found</h3>
                <p className="text-muted-foreground">
                  {filter === "all" 
                    ? "No assignments available at the moment."
                    : `No assignments match the "${filter}" filter.`}
                </p>
                {user?.role === "teacher" && filter === "all" && (
                  <Button className="mt-4" onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-assignment">
                    Create Your First Assignment
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Statistics */}
          <Card className="shadow-sm" data-testid="card-assignment-stats">
            <CardHeader>
              <CardTitle className="text-lg">Assignment Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Total Assignments</span>
                  <span className="font-semibold" data-testid="text-total-assignments">
                    {assignments.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Due This Week</span>
                  <span className="font-semibold text-accent" data-testid="text-due-this-week">
                    {assignments.filter((a: any) => {
                      const due = new Date(a.dueDate);
                      const now = new Date();
                      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                      return due >= now && due <= weekFromNow;
                    }).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Overdue</span>
                  <span className="font-semibold text-destructive" data-testid="text-overdue-count">
                    {assignments.filter((a: any) => new Date(a.dueDate) < new Date()).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Breakdown */}
          <Card className="shadow-sm" data-testid="card-subject-breakdown">
            <CardHeader>
              <CardTitle className="text-lg">By Subject</CardTitle>
            </CardHeader>
            <CardContent>
              {subjects.length > 0 ? (
                <div className="space-y-3">
                  {subjects.map((subject: any, index: number) => {
                    const subjectAssignments = assignments.filter((a: any) => a.subjectId === subject.id);
                    
                    return (
                      <div
                        key={subject.id}
                        className="flex items-center justify-between p-2 border border-border rounded-lg"
                        data-testid={`subject-breakdown-${index}`}
                      >
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{subject.name}</h4>
                          <p className="text-xs text-muted-foreground">{subject.code}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {subjectAssignments.length}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground text-sm">
                  No subjects available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {user?.role === "student" && (
            <Card className="shadow-sm" data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" data-testid="button-view-calendar">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-submission-history">
                  <FileText className="h-4 w-4 mr-2" />
                  Submission History
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
