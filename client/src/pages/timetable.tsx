import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Building } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Timetable() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const { data: allClasses = [] } = useQuery<any[]>({
    queryKey: ["/api/classes"],
    enabled: !!user,
  });

  const { data: subjects = [] } = useQuery<any[]>({
    queryKey: ["/api/subjects"],
    enabled: !!user,
  });

  // Group classes by day
  const classesByDay = DAYS.reduce((acc, day, index) => {
    acc[index] = allClasses.filter((cls: any) => cls.dayOfWeek === index);
    return acc;
  }, {} as Record<number, any[]>);

  const selectedDayClasses = classesByDay[selectedDay] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-testid="timetable-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Timetable
        </h1>
        <p className="text-muted-foreground">View your weekly class schedule</p>
      </div>

      {/* Day Selection */}
      <Card className="mb-6 shadow-sm" data-testid="card-day-selection">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day, index) => (
              <Button
                key={day}
                variant={selectedDay === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDay(index)}
                className="flex-1 min-w-[80px]"
                data-testid={`button-day-${index}`}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 3)}</span>
                {index === new Date().getDay() && (
                  <Badge variant="secondary" className="ml-2 text-xs">Today</Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timetable */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm" data-testid="card-daily-schedule">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{DAYS[selectedDay]} Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayClasses.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayClasses
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((cls, index) => (
                      <div
                        key={cls.id}
                        className="flex items-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        data-testid={`class-item-${index}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {cls.subject?.name || "Unknown Subject"}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {cls.subject?.code || "N/A"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{cls.startTime} - {cls.endTime}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>Room {cls.room}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4" />
                              <span>{cls.building}</span>
                            </div>
                          </div>

                          {user?.role === "teacher" && (
                            <div className="mt-3 flex space-x-2">
                              <Button size="sm" variant="outline" data-testid={`button-attendance-${index}`}>
                                Mark Attendance
                              </Button>
                              <Button size="sm" variant="ghost" data-testid={`button-notes-${index}`}>
                                Upload Notes
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Classes Scheduled</h3>
                  <p className="text-muted-foreground">
                    No classes are scheduled for {DAYS[selectedDay]}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weekly Overview */}
          <Card className="shadow-sm" data-testid="card-weekly-overview">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DAYS.map((day, index) => {
                  const dayClasses = classesByDay[index] || [];
                  const isToday = index === new Date().getDay();
                  
                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        isToday ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                      }`}
                      data-testid={`week-day-${index}`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          isToday ? "text-primary" : "text-foreground"
                        }`}>
                          {day}
                        </span>
                        {isToday && (
                          <Badge variant="secondary" className="text-xs">Today</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {dayClasses.length} class{dayClasses.length !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Subject List */}
          <Card className="shadow-sm" data-testid="card-subjects">
            <CardHeader>
              <CardTitle className="text-lg">Your Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              {subjects.length > 0 ? (
                <div className="space-y-2">
                  {subjects.map((subject: any, index: number) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between p-2 border border-border rounded-lg"
                      data-testid={`subject-item-${index}`}
                    >
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{subject.name}</h4>
                        <p className="text-xs text-muted-foreground">{subject.code}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {subject.credits} credits
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground text-sm">
                  No subjects available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-sm" data-testid="card-quick-stats">
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Total Classes</span>
                  <span className="font-semibold" data-testid="text-total-classes">
                    {Object.values(classesByDay).flat().length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Today's Classes</span>
                  <span className="font-semibold text-primary" data-testid="text-today-classes">
                    {classesByDay[new Date().getDay()]?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Subjects</span>
                  <span className="font-semibold" data-testid="text-subject-count">
                    {subjects.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
