import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRGenerator } from "@/components/qr-generator";
import { Calendar, Clock, MapPin, Building, BookOpen, CheckCircle, TrendingUp } from "lucide-react";
import type { Assignment, Notice, Class, Student } from "@shared/schema";

export default function StudentDashboard() {
  const { user, profile } = useAuth();

  const { data: nextClass } = useQuery<any>({
    queryKey: ["/api/timetable/next"],
    enabled: !!user,
  });

  const { data: todayClasses = [] } = useQuery<any[]>({
    queryKey: ["/api/timetable"],
    enabled: !!user,
  });

  const { data: assignments = [] } = useQuery<any[]>({
    queryKey: ["/api/assignments"],
    enabled: !!user,
  });

  const { data: notices = [] } = useQuery<any[]>({
    queryKey: ["/api/notices"],
    enabled: !!user,
  });

  const { data: studentProfile } = useQuery<any>({
    queryKey: ["/api/student/profile"],
    enabled: !!user,
  });

  if (!user) return null;

  const upcomingAssignments = assignments.slice(0, 3);
  const recentNotices = notices.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-testid="student-dashboard">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-welcome">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your studies today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Class Card */}
          <Card className="shadow-sm" data-testid="card-next-class">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Next Class</h2>
                  <p className="text-sm text-muted-foreground">Your upcoming schedule</p>
                </div>
                {nextClass && !nextClass.message && (
                  <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                    In 45 mins
                  </div>
                )}
              </div>

              {nextClass && !nextClass.message ? (
                <>
                  <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-lg text-primary-foreground mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold" data-testid="text-next-class-subject">
                          {nextClass.subject?.name || "Unknown Subject"}
                        </h3>
                        <p className="text-primary-foreground/80" data-testid="text-next-class-teacher">
                          {nextClass.teacher?.name || "Unknown Teacher"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" data-testid="text-next-class-time">
                          {nextClass.startTime}
                        </p>
                        <p className="text-primary-foreground/80" data-testid="text-next-class-room">
                          Room {nextClass.room}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Duration: 90 minutes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span>Building: {nextClass.building}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No more classes today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="shadow-sm" data-testid="card-today-schedule">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {todayClasses.length > 0 ? (
                <div className="space-y-3">
                  {todayClasses.map((cls: any, index: number) => (
                    <div
                      key={cls.id}
                      className={`flex items-center p-3 rounded-lg ${
                        index === 0 ? "bg-muted/50" : "border border-border"
                      }`}
                      data-testid={`schedule-item-${index}`}
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <BookOpen className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {cls.subject?.name || "Unknown Subject"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {cls.teacher?.name || "Unknown Teacher"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{cls.startTime}</p>
                        <p className="text-sm text-muted-foreground">Room {cls.room}</p>
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

          {/* Assignments Section */}
          <Card className="shadow-sm" data-testid="card-assignments">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Assignments</CardTitle>
              <Button variant="ghost" size="sm" data-testid="button-view-all-assignments">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingAssignments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment: any, index: number) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                      data-testid={`assignment-item-${index}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-destructive rounded-full"></div>
                        <div>
                          <h4 className="font-medium text-foreground">{assignment.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {assignment.subject?.name || "Unknown Subject"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-destructive">
                          Due {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(assignment.dueDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming assignments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Student ID Card */}
          <Card className="shadow-sm" data-testid="card-student-id">
            <CardHeader>
              <CardTitle className="text-lg">Digital Student ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-lg text-primary-foreground mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-15 h-15 bg-primary-foreground/20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold" data-testid="text-student-name">
                      {user.firstName} {user.lastName}
                    </h4>
                    <p className="text-sm text-primary-foreground/80" data-testid="text-student-program">
                      {studentProfile?.program || "B.Tech Computer Science"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-primary-foreground/90">
                  <div>
                    <p className="text-xs text-primary-foreground/70">Student ID</p>
                    <p className="font-medium" data-testid="text-student-id">
                      {studentProfile?.studentId || "CS2021001"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-foreground/70">Year</p>
                    <p className="font-medium" data-testid="text-student-year">
                      {studentProfile?.year || 3}rd Year
                    </p>
                  </div>
                </div>
              </div>

              {studentProfile?.qrCode && (
                <QRGenerator
                  value={studentProfile.qrCode}
                  size={128}
                  className="mb-3"
                />
              )}
            </CardContent>
          </Card>

          {/* Notice Board */}
          <Card className="shadow-sm" data-testid="card-notice-board">
            <CardHeader>
              <CardTitle className="text-lg">Notice Board</CardTitle>
            </CardHeader>
            <CardContent>
              {recentNotices.length > 0 ? (
                <div className="space-y-3">
                  {recentNotices.map((notice: any, index: number) => (
                    <div
                      key={notice.id}
                      className="p-3 bg-muted/50 rounded-lg"
                      data-testid={`notice-item-${index}`}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground text-sm">{notice.title}</h5>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notice.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No recent notices</p>
              )}

              <Button variant="ghost" className="w-full mt-4" size="sm" data-testid="button-view-all-notices">
                View All Notices
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-sm" data-testid="card-quick-stats">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm text-foreground">Attendance</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-secondary" data-testid="text-attendance-percentage">87%</p>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-accent" />
                    <span className="text-sm text-foreground">Assignments</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground" data-testid="text-assignments-completed">8/10</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">Grade Average</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary" data-testid="text-grade-average">8.6</p>
                    <p className="text-xs text-muted-foreground">GPA</p>
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
