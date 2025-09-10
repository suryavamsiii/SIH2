import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { Home, Calendar, BookOpen, Megaphone, User } from "lucide-react";

export function MobileNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { 
      href: `/${user.role}-dashboard`, 
      label: "Home", 
      icon: Home 
    },
    { 
      href: "/timetable", 
      label: "Schedule", 
      icon: Calendar 
    },
    { 
      href: "/assignments", 
      label: "Tasks", 
      icon: BookOpen 
    },
    { 
      href: "/notices", 
      label: "Notices", 
      icon: Megaphone 
    },
    { 
      href: user.role === "student" ? "/student-id" : `/${user.role}-dashboard`, 
      label: "Profile", 
      icon: User 
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50" data-testid="mobile-navigation">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center transition-colors ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              }`}
              data-testid={`mobile-link-${item.label.toLowerCase()}`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
