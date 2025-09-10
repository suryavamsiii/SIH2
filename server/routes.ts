import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertStudentSchema, insertTeacherSchema, insertAssignmentSchema, insertNoticeSchema, insertFeedbackSchema, insertAttendanceSchema } from "@shared/schema";
import { z } from "zod";
import { summarizeText, chatWithAI } from "./services/gemini";

const JWT_SECRET = process.env.JWT_SECRET || "edutrack-secret-key";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    studentId?: string;
    teacherId?: string;
  };
}

// Middleware to verify JWT token
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    // Add role-specific IDs
    if (user.role === "student") {
      const student = await storage.getStudentByUserId(user.id);
      if (student) req.user.studentId = student.id;
    } else if (user.role === "teacher") {
      const teacher = await storage.getTeacherByUserId(user.id);
      if (teacher) req.user.teacherId = teacher.id;
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Role-based authorization middleware
const authorize = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const { confirmPassword, ...userToCreate } = userData;
      const user = await storage.createUser(userToCreate);
      
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });
      
      res.status(201).json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req: any, res) => {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = null;
    if (user.role === "student") {
      profile = await storage.getStudentByUserId(user.id);
    } else if (user.role === "teacher") {
      profile = await storage.getTeacherByUserId(user.id);
    }

    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      profile,
    });
  });

  // Timetable routes
  app.get("/api/timetable", authenticate, async (req: any, res) => {
    try {
      const today = new Date().getDay();
      const classes = await storage.getClassesByDay(today);
      
      // Enrich with subject and teacher data
      const enrichedClasses = await Promise.all(classes.map(async (cls) => {
        const subject = await storage.getSubject(cls.subjectId);
        const teacher = await storage.getTeacher(cls.teacherId);
        const teacherUser = teacher ? await storage.getUser(teacher.userId) : null;
        
        return {
          ...cls,
          subject,
          teacher: teacherUser ? {
            name: `${teacherUser.firstName} ${teacherUser.lastName}`,
            id: teacher?.teacherId,
          } : null,
        };
      }));

      res.json(enrichedClasses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timetable" });
    }
  });

  app.get("/api/timetable/next", authenticate, async (req: any, res) => {
    try {
      const now = new Date();
      const today = now.getDay();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const todayClasses = await storage.getClassesByDay(today);
      
      // Find next class
      const nextClass = todayClasses
        .filter(cls => cls.startTime > currentTime)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

      if (!nextClass) {
        return res.json({ message: "No more classes today" });
      }

      // Enrich with subject and teacher data
      const subject = await storage.getSubject(nextClass.subjectId);
      const teacher = await storage.getTeacher(nextClass.teacherId);
      const teacherUser = teacher ? await storage.getUser(teacher.userId) : null;

      res.json({
        ...nextClass,
        subject,
        teacher: teacherUser ? {
          name: `${teacherUser.firstName} ${teacherUser.lastName}`,
          id: teacher?.teacherId,
        } : null,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch next class" });
    }
  });

  // Attendance routes
  app.post("/api/attendance/mark", authenticate, authorize(["teacher"]), async (req: any, res) => {
    try {
      const { studentQR, classId } = req.body;
      
      // Find student by QR code
      const student = await storage.getStudentByStudentId(studentQR.split('-')[0]);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Check if attendance already marked for today
      const today = new Date();
      const existingAttendance = await storage.getAttendanceByClass(classId, today);
      const alreadyMarked = existingAttendance.find(att => att.studentId === student.id);
      
      if (alreadyMarked) {
        return res.status(400).json({ message: "Attendance already marked for this student" });
      }

      const attendance = await storage.markAttendance({
        studentId: student.id,
        classId,
        date: today,
        present: true,
      });

      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });

  app.get("/api/attendance/student/:studentId", authenticate, async (req: any, res) => {
    try {
      const { studentId } = req.params;
      const attendance = await storage.getAttendanceByStudent(studentId);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  // AI Assistant routes
  app.post("/api/ai-assistant", authenticate, async (req: any, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const user = await storage.getUser(req.user.id);
      let userContext = `User: ${user?.firstName} ${user?.lastName} (${user?.role})`;
      
      if (user?.role === "student") {
        const student = await storage.getStudentByUserId(user.id);
        if (student) {
          userContext += `, Student ID: ${student.studentId}, Program: ${student.program}, Year: ${student.year}`;
        }
      }

      const response = await chatWithAI(message, userContext, context);
      res.json({ response });
    } catch (error) {
      console.error("AI Assistant error:", error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  // Assignment routes
  app.get("/api/assignments", authenticate, async (req: any, res) => {
    try {
      let assignments: any[] = [];
      
      if (req.user.role === "student") {
        // Get assignments for student's subjects
        const allAssignments = await storage.getAssignmentsBySubject("sub-1"); // TODO: Get student's subjects
        assignments = allAssignments;
      } else if (req.user.role === "teacher" && req.user.teacherId) {
        assignments = await storage.getAssignmentsByTeacher(req.user.teacherId);
      } else {
        assignments = [];
      }

      // Enrich with subject data
      const enrichedAssignments = await Promise.all(assignments.map(async (assignment: any) => {
        const subject = await storage.getSubject(assignment.subjectId);
        return { ...assignment, subject };
      }));

      res.json(enrichedAssignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post("/api/assignments", authenticate, authorize(["teacher"]), async (req: any, res) => {
    try {
      const assignmentData = insertAssignmentSchema.parse({
        ...req.body,
        teacherId: req.user.teacherId,
      });
      
      const assignment = await storage.createAssignment(assignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ message: "Invalid assignment data" });
    }
  });

  // Notice routes
  app.get("/api/notices", authenticate, async (req: any, res) => {
    try {
      let notices;
      
      if (req.user.role === "admin") {
        notices = await storage.getAllNotices();
      } else {
        notices = await storage.getNoticesByAudience(req.user.role);
      }

      res.json(notices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  app.post("/api/notices", authenticate, authorize(["admin", "teacher"]), async (req: any, res) => {
    try {
      const noticeData = insertNoticeSchema.parse({
        ...req.body,
        createdBy: req.user.id,
      });
      
      const notice = await storage.createNotice(noticeData);
      res.status(201).json(notice);
    } catch (error) {
      res.status(400).json({ message: "Invalid notice data" });
    }
  });

  // Feedback routes
  app.post("/api/feedback", authenticate, authorize(["student"]), async (req: any, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        studentId: req.user.studentId,
      });
      
      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error) {
      res.status(400).json({ message: "Invalid feedback data" });
    }
  });

  // Student profile routes
  app.get("/api/student/profile", authenticate, authorize(["student"]), async (req: any, res) => {
    try {
      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      const user = await storage.getUser(req.user.id);
      res.json({ 
        ...student, 
        user: {
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student profile" });
    }
  });

  // Subject routes
  app.get("/api/subjects", authenticate, async (req: any, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Class management routes (for admin/teachers)
  app.get("/api/classes", authenticate, authorize(["admin", "teacher"]), async (req: any, res) => {
    try {
      let classes;
      
      if (req.user.role === "teacher" && req.user.teacherId) {
        classes = await storage.getClassesByTeacher(req.user.teacherId);
      } else {
        // Admin can see all classes
        const allDays = [0, 1, 2, 3, 4, 5, 6];
        const allClasses = await Promise.all(allDays.map(day => storage.getClassesByDay(day)));
        classes = allClasses.flat();
      }

      // Enrich with subject data
      const enrichedClasses = await Promise.all(classes.map(async (cls) => {
        const subject = await storage.getSubject(cls.subjectId);
        return { ...cls, subject };
      }));

      res.json(enrichedClasses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
