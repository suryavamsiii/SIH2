import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { Navigation } from "@/components/navigation";
import { MobileNavigation } from "@/components/mobile-nav";
import { AIChat } from "@/components/ai-chat";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import StudentDashboard from "@/pages/student-dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import Timetable from "@/pages/timetable";
import Assignments from "@/pages/assignments";
import Notices from "@/pages/notices";
import StudentID from "@/pages/student-id";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => 
        user ? <StudentDashboard /> : <Login />
      } />
      <Route path="/student-dashboard" component={() => 
        <ProtectedRoute><StudentDashboard /></ProtectedRoute>
      } />
      <Route path="/teacher-dashboard" component={() => 
        <ProtectedRoute><TeacherDashboard /></ProtectedRoute>
      } />
      <Route path="/admin-dashboard" component={() => 
        <ProtectedRoute><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/timetable" component={() => 
        <ProtectedRoute><Timetable /></ProtectedRoute>
      } />
      <Route path="/assignments" component={() => 
        <ProtectedRoute><Assignments /></ProtectedRoute>
      } />
      <Route path="/notices" component={() => 
        <ProtectedRoute><Notices /></ProtectedRoute>
      } />
      <Route path="/student-id" component={() => 
        <ProtectedRoute><StudentID /></ProtectedRoute>
      } />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {user && <Navigation />}
      <div className={user ? "pb-16 md:pb-0" : ""}>
        <Router />
      </div>
      {user && <MobileNavigation />}
      {user && <AIChat />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
