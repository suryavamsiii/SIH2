import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Calendar, ClipboardList } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();

  const { data: classes = [] } = useQuery<any[]>({
    queryKey: ["/api/classes"],
    enabled: !!user,
  });

  const { data: assignments = [] } = useQuery<any[]>({
    queryKey: ["/api/assignments"],
    enabled: !!user,
  });

  const { data: todayClasses = [] } = useQuery<any[]>({
    queryKey: ["/api/timetable"],
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-testid="teacher-dashboard">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-welcome">
          Welcome back, Prof. {user.firstName}!
        </h1>
        <p className="text-muted-foreground">Here's your teaching schedule and student activities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Classes */}
          <Card className="shadow-sm" data-testid="card-today-classes">
            <CardHeader>
              <CardTitle>Today's Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {todayClasses.length > 0 ? (
                <div className="space-y-3">
                  {todayClasses.map((cls: any, index: number) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                      data-testid={`class-item-${index}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BookOpen className="text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {cls.subject?.name || "Unknown Subject"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Room {cls.room}, {cls.building}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {cls.startTime} - {cls.endTime}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2" data-testid={`button-attendance-${index}`}>
                          Mark Attendance
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No classes scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card className="shadow-sm" data-testid="card-assignments">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Assignments</CardTitle>
              <Button variant="outline" size="sm" data-testid="button-create-assignment">
                Create Assignment
              </Button>
            </CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
                <div className="space-y-3">
                  {assignments.slice(0, 5).map((assignment: any, index: number) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                      data-testid={`assignment-item-${index}`}
                    >
                      <div>
                        <h4 className="font-medium text-foreground">{assignment.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {assignment.subject?.name || "Unknown Subject"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                        <Button variant="ghost" size="sm" data-testid={`button-view-submissions-${index}`}>
                          View Submissions
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No assignments created yet</p>
                  <Button variant="outline" className="mt-4" data-testid="button-create-first-assignment">
                    Create Your First Assignment
                  </Button>
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
              <Button className="w-full justify-start" variant="outline" data-testid="button-quick-attendance">
                <Users className="h-4 w-4 mr-2" />
                Quick Attendance
              </Button>
              <Button className="w-full justify-start" variant="outline" data-testid="button-upload-notes">
                <BookOpen className="h-4 w-4 mr-2" />
                Upload Class Notes
              </Button>
              <Button className="w-full justify-start" variant="outline" data-testid="button-create-notice">
                <ClipboardList className="h-4 w-4 mr-2" />
                Create Notice
              </Button>
            </CardContent>
          </Card>

          {/* Class Statistics */}
          <Card className="shadow-sm" data-testid="card-class-stats">
            <CardHeader>
              <CardTitle className="text-lg">Class Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Total Classes</span>
                  <span className="font-semibold" data-testid="text-total-classes">{classes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Active Assignments</span>
                  <span className="font-semibold" data-testid="text-active-assignments">{assignments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Avg. Attendance</span>
                  <span className="font-semibold text-secondary" data-testid="text-avg-attendance">85%</span>
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
                    <p className="text-sm text-foreground">Assignment submitted by 15 students</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3" data-testid="activity-item-1">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">Attendance marked for CS301</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3" data-testid="activity-item-2">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">New notice published</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
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
