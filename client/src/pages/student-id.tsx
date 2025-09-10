import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRGenerator } from "@/components/qr-generator";
import { Badge } from "@/components/ui/badge";
import { Share2, Download, Mail, Phone, MapPin, Calendar } from "lucide-react";

export default function StudentID() {
  const { user } = useAuth();

  const { data: studentProfile } = useQuery<any>({
    queryKey: ["/api/student/profile"],
    enabled: !!user && user.role === "student",
  });

  const { data: attendanceStats } = useQuery<any>({
    queryKey: ["/api/attendance/student", studentProfile?.id],
    enabled: !!studentProfile,
  });

  if (!user || user.role !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Access denied. Student access required.</p>
      </div>
    );
  }

  const shareProfile = async () => {
    if (navigator.share && studentProfile) {
      try {
        await navigator.share({
          title: `${user.firstName} ${user.lastName} - Student Profile`,
          text: `Student ID: ${studentProfile.studentId}\nProgram: ${studentProfile.program}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-testid="student-id-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Digital Student ID
        </h1>
        <p className="text-muted-foreground">
          Your official digital identification and QR code for attendance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main ID Card */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg overflow-hidden" data-testid="card-student-id">
            <div className="bg-gradient-to-br from-primary to-secondary p-6 text-primary-foreground">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" data-testid="text-student-name">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-primary-foreground/80" data-testid="text-student-program">
                      {studentProfile?.program || "B.Tech Computer Science"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1" data-testid="text-student-id">
                    {studentProfile?.studentId || "CS2021001"}
                  </div>
                  <p className="text-sm text-primary-foreground/80">Student ID</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-primary-foreground/70 mb-1">Academic Year</p>
                  <p className="font-semibold" data-testid="text-academic-year">
                    {studentProfile?.year || 3}rd Year
                  </p>
                </div>
                <div>
                  <p className="text-primary-foreground/70 mb-1">Semester</p>
                  <p className="font-semibold" data-testid="text-semester">
                    {studentProfile?.semester || 6}th Semester
                  </p>
                </div>
                <div>
                  <p className="text-primary-foreground/70 mb-1">Status</p>
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm" data-testid="text-email">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm" data-testid="text-phone">+91 98765 43210</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm" data-testid="text-address">Mumbai, Maharashtra</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Academic Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Admission Date</span>
                      <span className="text-sm font-medium" data-testid="text-admission-date">
                        August 2021
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Expected Graduation</span>
                      <span className="text-sm font-medium" data-testid="text-graduation-date">
                        June 2025
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current CGPA</span>
                      <span className="text-sm font-medium text-primary" data-testid="text-cgpa">
                        8.6
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={shareProfile} data-testid="button-share-profile">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                  <Button variant="outline" data-testid="button-download-id">
                    <Download className="h-4 w-4 mr-2" />
                    Download ID Card
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card className="shadow-sm" data-testid="card-qr-code">
            <CardHeader>
              <CardTitle className="text-lg">Attendance QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              {studentProfile?.qrCode ? (
                <div className="text-center">
                  <QRGenerator
                    value={studentProfile.qrCode}
                    size={160}
                    className="mb-4"
                  />
                  <p className="text-xs text-muted-foreground mb-3">
                    Show this QR code to your teacher for attendance marking
                  </p>
                  <p className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded">
                    ID: {studentProfile.qrCode}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-32 h-32 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-muted-foreground">QR Code</span>
                  </div>
                  <p className="text-sm text-muted-foreground">QR code not available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Stats */}
          <Card className="shadow-sm" data-testid="card-attendance-stats">
            <CardHeader>
              <CardTitle className="text-lg">Attendance Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-1" data-testid="text-attendance-percentage">
                    87%
                  </div>
                  <p className="text-sm text-muted-foreground">Overall Attendance</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">This Month</span>
                    <span className="font-semibold text-secondary" data-testid="text-month-attendance">92%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Classes Attended</span>
                    <span className="font-semibold" data-testid="text-classes-attended">45/52</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Consecutive Days</span>
                    <span className="font-semibold text-primary" data-testid="text-consecutive-days">12</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full" 
                      style={{ width: "87%" }}
                      data-testid="attendance-progress-bar"
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Minimum required: 75%
                  </p>
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
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">Attendance marked</p>
                    <p className="text-xs text-muted-foreground">Data Structures - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3" data-testid="activity-item-1">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">Assignment submitted</p>
                    <p className="text-xs text-muted-foreground">Database Management - 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3" data-testid="activity-item-2">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">Profile updated</p>
                    <p className="text-xs text-muted-foreground">Contact information - 3 days ago</p>
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
