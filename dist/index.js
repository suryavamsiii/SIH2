// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import jwt from "jsonwebtoken";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users = /* @__PURE__ */ new Map();
  students = /* @__PURE__ */ new Map();
  teachers = /* @__PURE__ */ new Map();
  subjects = /* @__PURE__ */ new Map();
  classes = /* @__PURE__ */ new Map();
  attendance = /* @__PURE__ */ new Map();
  assignments = /* @__PURE__ */ new Map();
  submissions = /* @__PURE__ */ new Map();
  notices = /* @__PURE__ */ new Map();
  feedbacks = /* @__PURE__ */ new Map();
  constructor() {
    this.initializeData();
  }
  initializeData() {
    const adminUser = {
      id: "admin-1",
      username: "admin",
      password: "admin123",
      // In production, this would be hashed
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      email: "admin@edutrack.com",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(adminUser.id, adminUser);
    const teacherUser = {
      id: "teacher-1",
      username: "sarah.johnson",
      password: "teacher123",
      role: "teacher",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@edutrack.com",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(teacherUser.id, teacherUser);
    const teacher = {
      id: "t-1",
      userId: "teacher-1",
      teacherId: "T001",
      department: "Computer Science",
      subjects: ["Data Structures", "Algorithms"]
    };
    this.teachers.set(teacher.id, teacher);
    const studentUser = {
      id: "student-1",
      username: "rahul.sharma",
      password: "student123",
      role: "student",
      firstName: "Rahul",
      lastName: "Sharma",
      email: "rahul.sharma@student.edutrack.com",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(studentUser.id, studentUser);
    const student = {
      id: "s-1",
      userId: "student-1",
      studentId: "CS2021001",
      program: "B.Tech Computer Science",
      year: 3,
      semester: 6,
      qrCode: "CS2021001-QR"
    };
    this.students.set(student.id, student);
    const subject = {
      id: "sub-1",
      name: "Data Structures & Algorithms",
      code: "CS301",
      credits: 4,
      department: "Computer Science"
    };
    this.subjects.set(subject.id, subject);
    const classData = {
      id: "class-1",
      subjectId: "sub-1",
      teacherId: "t-1",
      dayOfWeek: 1,
      // Monday
      startTime: "10:30",
      endTime: "12:00",
      room: "204",
      building: "Science Block"
    };
    this.classes.set(classData.id, classData);
    const assignment = {
      id: "assign-1",
      title: "Binary Tree Implementation",
      description: "Implement a binary search tree with insert, delete, and search operations",
      subjectId: "sub-1",
      teacherId: "t-1",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1e3),
      // Tomorrow
      maxMarks: 100,
      attachments: [],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.assignments.set(assignment.id, assignment);
    const notice = {
      id: "notice-1",
      title: "Mid-term Exams Schedule",
      content: "Exams starting from March 25th. Check detailed schedule on portal.",
      type: "exam",
      priority: "high",
      targetAudience: ["students"],
      createdBy: "admin-1",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1e3),
      // 2 hours ago
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3)
      // 1 week from now
    };
    this.notices.set(notice.id, notice);
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
      ...insertUser,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }
  // Student operations
  async getStudent(id) {
    return this.students.get(id);
  }
  async getStudentByUserId(userId) {
    return Array.from(this.students.values()).find((student) => student.userId === userId);
  }
  async getStudentByStudentId(studentId) {
    return Array.from(this.students.values()).find((student) => student.studentId === studentId);
  }
  async createStudent(insertStudent) {
    const id = randomUUID();
    const qrCode = `${insertStudent.studentId}-${randomUUID().substring(0, 8)}`;
    const student = {
      ...insertStudent,
      id,
      qrCode
    };
    this.students.set(id, student);
    return student;
  }
  async updateStudent(id, updates) {
    const student = this.students.get(id);
    if (!student) return void 0;
    const updated = { ...student, ...updates };
    this.students.set(id, updated);
    return updated;
  }
  // Teacher operations
  async getTeacher(id) {
    return this.teachers.get(id);
  }
  async getTeacherByUserId(userId) {
    return Array.from(this.teachers.values()).find((teacher) => teacher.userId === userId);
  }
  async createTeacher(insertTeacher) {
    const id = randomUUID();
    const teacher = {
      ...insertTeacher,
      id,
      subjects: insertTeacher.subjects || null
    };
    this.teachers.set(id, teacher);
    return teacher;
  }
  async updateTeacher(id, updates) {
    const teacher = this.teachers.get(id);
    if (!teacher) return void 0;
    const updated = { ...teacher, ...updates };
    this.teachers.set(id, updated);
    return updated;
  }
  // Subject operations
  async getSubject(id) {
    return this.subjects.get(id);
  }
  async getAllSubjects() {
    return Array.from(this.subjects.values());
  }
  async createSubject(insertSubject) {
    const id = randomUUID();
    const subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }
  async updateSubject(id, updates) {
    const subject = this.subjects.get(id);
    if (!subject) return void 0;
    const updated = { ...subject, ...updates };
    this.subjects.set(id, updated);
    return updated;
  }
  // Class operations
  async getClass(id) {
    return this.classes.get(id);
  }
  async getClassesByDay(dayOfWeek) {
    return Array.from(this.classes.values()).filter((cls) => cls.dayOfWeek === dayOfWeek);
  }
  async getClassesByTeacher(teacherId) {
    return Array.from(this.classes.values()).filter((cls) => cls.teacherId === teacherId);
  }
  async createClass(insertClass) {
    const id = randomUUID();
    const classData = { ...insertClass, id };
    this.classes.set(id, classData);
    return classData;
  }
  async updateClass(id, updates) {
    const classData = this.classes.get(id);
    if (!classData) return void 0;
    const updated = { ...classData, ...updates };
    this.classes.set(id, updated);
    return updated;
  }
  async deleteClass(id) {
    return this.classes.delete(id);
  }
  // Attendance operations
  async getAttendance(id) {
    return this.attendance.get(id);
  }
  async getAttendanceByStudent(studentId) {
    return Array.from(this.attendance.values()).filter((att) => att.studentId === studentId);
  }
  async getAttendanceByClass(classId, date) {
    const dateStr = date.toDateString();
    return Array.from(this.attendance.values()).filter(
      (att) => att.classId === classId && att.date.toDateString() === dateStr
    );
  }
  async markAttendance(insertAttendance) {
    const id = randomUUID();
    const attendance2 = {
      ...insertAttendance,
      id,
      markedAt: /* @__PURE__ */ new Date()
    };
    this.attendance.set(id, attendance2);
    return attendance2;
  }
  // Assignment operations
  async getAssignment(id) {
    return this.assignments.get(id);
  }
  async getAssignmentsBySubject(subjectId) {
    return Array.from(this.assignments.values()).filter((assignment) => assignment.subjectId === subjectId);
  }
  async getAssignmentsByTeacher(teacherId) {
    return Array.from(this.assignments.values()).filter((assignment) => assignment.teacherId === teacherId);
  }
  async createAssignment(insertAssignment) {
    const id = randomUUID();
    const assignment = {
      ...insertAssignment,
      id,
      description: insertAssignment.description || null,
      maxMarks: insertAssignment.maxMarks || null,
      attachments: insertAssignment.attachments || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.assignments.set(id, assignment);
    return assignment;
  }
  async updateAssignment(id, updates) {
    const assignment = this.assignments.get(id);
    if (!assignment) return void 0;
    const updated = { ...assignment, ...updates };
    this.assignments.set(id, updated);
    return updated;
  }
  // Submission operations
  async getSubmission(id) {
    return this.submissions.get(id);
  }
  async getSubmissionsByAssignment(assignmentId) {
    return Array.from(this.submissions.values()).filter((sub) => sub.assignmentId === assignmentId);
  }
  async getSubmissionsByStudent(studentId) {
    return Array.from(this.submissions.values()).filter((sub) => sub.studentId === studentId);
  }
  async createSubmission(insertSubmission) {
    const id = randomUUID();
    const submission = {
      ...insertSubmission,
      id,
      content: insertSubmission.content || null,
      attachments: insertSubmission.attachments || null,
      feedback: insertSubmission.feedback || null,
      marks: insertSubmission.marks || null,
      submittedAt: /* @__PURE__ */ new Date()
    };
    this.submissions.set(id, submission);
    return submission;
  }
  async updateSubmission(id, updates) {
    const submission = this.submissions.get(id);
    if (!submission) return void 0;
    const updated = { ...submission, ...updates };
    this.submissions.set(id, updated);
    return updated;
  }
  // Notice operations
  async getNotice(id) {
    return this.notices.get(id);
  }
  async getAllNotices() {
    return Array.from(this.notices.values()).sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
  }
  async getNoticesByAudience(audience) {
    return Array.from(this.notices.values()).filter((notice) => notice.targetAudience?.includes(audience) || notice.targetAudience?.includes("all")).sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
  }
  async createNotice(insertNotice) {
    const id = randomUUID();
    const notice = {
      ...insertNotice,
      id,
      targetAudience: insertNotice.targetAudience || null,
      expiresAt: insertNotice.expiresAt || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.notices.set(id, notice);
    return notice;
  }
  async updateNotice(id, updates) {
    const notice = this.notices.get(id);
    if (!notice) return void 0;
    const updated = { ...notice, ...updates };
    this.notices.set(id, updated);
    return updated;
  }
  async deleteNotice(id) {
    return this.notices.delete(id);
  }
  // Feedback operations
  async getFeedback(id) {
    return this.feedbacks.get(id);
  }
  async getFeedbackBySubject(subjectId) {
    return Array.from(this.feedbacks.values()).filter((feedback2) => feedback2.subjectId === subjectId);
  }
  async createFeedback(insertFeedback) {
    const id = randomUUID();
    const feedback2 = {
      ...insertFeedback,
      id,
      teacherId: insertFeedback.teacherId || null,
      subjectId: insertFeedback.subjectId || null,
      comments: insertFeedback.comments || null,
      anonymous: insertFeedback.anonymous ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.feedbacks.set(id, feedback2);
    return feedback2;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  // "student", "teacher", "admin"
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
});
var students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  studentId: text("student_id").notNull().unique(),
  program: text("program").notNull(),
  year: integer("year").notNull(),
  semester: integer("semester").notNull(),
  qrCode: text("qr_code").notNull()
});
var teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  teacherId: text("teacher_id").notNull().unique(),
  department: text("department").notNull(),
  subjects: text("subjects").array()
});
var subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  credits: integer("credits").notNull(),
  department: text("department").notNull()
});
var classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id),
  dayOfWeek: integer("day_of_week").notNull(),
  // 0-6 (Sunday-Saturday)
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  room: text("room").notNull(),
  building: text("building").notNull()
});
var attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  classId: varchar("class_id").notNull().references(() => classes.id),
  date: timestamp("date").notNull(),
  present: boolean("present").notNull(),
  markedAt: timestamp("marked_at").defaultNow()
});
var assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id),
  dueDate: timestamp("due_date").notNull(),
  maxMarks: integer("max_marks"),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow()
});
var submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assignmentId: varchar("assignment_id").notNull().references(() => assignments.id),
  studentId: varchar("student_id").notNull().references(() => students.id),
  content: text("content"),
  attachments: text("attachments").array(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  marks: integer("marks"),
  feedback: text("feedback")
});
var notices = pgTable("notices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(),
  // "general", "academic", "exam", "event"
  priority: text("priority").notNull(),
  // "low", "medium", "high"
  targetAudience: text("target_audience").array(),
  // ["students", "teachers", "all"]
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at")
});
var feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  subjectId: varchar("subject_id").references(() => subjects.id),
  teacherId: varchar("teacher_id").references(() => teachers.id),
  type: text("type").notNull(),
  // "teaching", "resources", "general"
  rating: integer("rating").notNull(),
  comments: text("comments"),
  anonymous: boolean("anonymous").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
var insertStudentSchema = createInsertSchema(students).omit({ id: true, qrCode: true });
var insertTeacherSchema = createInsertSchema(teachers).omit({ id: true });
var insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
var insertClassSchema = createInsertSchema(classes).omit({ id: true });
var insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, markedAt: true });
var insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true, createdAt: true });
var insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, submittedAt: true });
var insertNoticeSchema = createInsertSchema(notices).omit({ id: true, createdAt: true });
var insertFeedbackSchema = createInsertSchema(feedback).omit({ id: true, createdAt: true });
var loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});
var registerSchema = insertUserSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// server/services/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
var ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
async function chatWithAI(message, userContext, additionalContext) {
  try {
    const systemPrompt = `You are an AI educational assistant for EduTrack, a smart educational management system. 
    
You help students, teachers, and administrators with:
- Timetable and schedule questions
- Assignment guidance and study help
- Syllabus completion tracking
- Academic planning and organization
- General educational support

Current user context: ${userContext}
${additionalContext ? `Additional context: ${additionalContext}` : ""}

Respond in a helpful, educational manner. Keep responses concise but informative. 
If asked about specific data (like grades, attendance, assignments), remind users to check their dashboard for real-time information.
Always maintain a supportive, academic tone.`;
    const response = await ai.getGenerativeModel({ model: "gemini-2.5-flash" }).generateContent({
      contents: [
        {
          role: "system",
          parts: [{ text: systemPrompt }]
        },
        {
          role: "user",
          parts: [{ text: message }]
        }
      ]
    });
    return response.response.text() || "I apologize, but I'm having trouble responding right now. Please try again.";
  } catch (error) {
    console.error("Gemini AI error:", error);
    throw new Error("Failed to get AI response");
  }
}

// server/routes.ts
var JWT_SECRET = process.env.JWT_SECRET || "edutrack-secret-key";
var authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = {
      id: user.id,
      role: user.role
    };
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
var authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};
async function registerRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
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
          email: user.email
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
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
          email: user.email
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  app2.get("/api/auth/me", authenticate, async (req, res) => {
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
        email: user.email
      },
      profile
    });
  });
  app2.get("/api/timetable", authenticate, async (req, res) => {
    try {
      const today = (/* @__PURE__ */ new Date()).getDay();
      const classes2 = await storage.getClassesByDay(today);
      const enrichedClasses = await Promise.all(classes2.map(async (cls) => {
        const subject = await storage.getSubject(cls.subjectId);
        const teacher = await storage.getTeacher(cls.teacherId);
        const teacherUser = teacher ? await storage.getUser(teacher.userId) : null;
        return {
          ...cls,
          subject,
          teacher: teacherUser ? {
            name: `${teacherUser.firstName} ${teacherUser.lastName}`,
            id: teacher?.teacherId
          } : null
        };
      }));
      res.json(enrichedClasses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timetable" });
    }
  });
  app2.get("/api/timetable/next", authenticate, async (req, res) => {
    try {
      const now = /* @__PURE__ */ new Date();
      const today = now.getDay();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const todayClasses = await storage.getClassesByDay(today);
      const nextClass = todayClasses.filter((cls) => cls.startTime > currentTime).sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
      if (!nextClass) {
        return res.json({ message: "No more classes today" });
      }
      const subject = await storage.getSubject(nextClass.subjectId);
      const teacher = await storage.getTeacher(nextClass.teacherId);
      const teacherUser = teacher ? await storage.getUser(teacher.userId) : null;
      res.json({
        ...nextClass,
        subject,
        teacher: teacherUser ? {
          name: `${teacherUser.firstName} ${teacherUser.lastName}`,
          id: teacher?.teacherId
        } : null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch next class" });
    }
  });
  app2.post("/api/attendance/mark", authenticate, authorize(["teacher"]), async (req, res) => {
    try {
      const { studentQR, classId } = req.body;
      const student = await storage.getStudentByStudentId(studentQR.split("-")[0]);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      const today = /* @__PURE__ */ new Date();
      const existingAttendance = await storage.getAttendanceByClass(classId, today);
      const alreadyMarked = existingAttendance.find((att) => att.studentId === student.id);
      if (alreadyMarked) {
        return res.status(400).json({ message: "Attendance already marked for this student" });
      }
      const attendance2 = await storage.markAttendance({
        studentId: student.id,
        classId,
        date: today,
        present: true
      });
      res.json(attendance2);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });
  app2.get("/api/attendance/student/:studentId", authenticate, async (req, res) => {
    try {
      const { studentId } = req.params;
      const attendance2 = await storage.getAttendanceByStudent(studentId);
      res.json(attendance2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });
  app2.post("/api/ai-assistant", authenticate, async (req, res) => {
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
  app2.get("/api/assignments", authenticate, async (req, res) => {
    try {
      let assignments2 = [];
      if (req.user.role === "student") {
        const allAssignments = await storage.getAssignmentsBySubject("sub-1");
        assignments2 = allAssignments;
      } else if (req.user.role === "teacher" && req.user.teacherId) {
        assignments2 = await storage.getAssignmentsByTeacher(req.user.teacherId);
      } else {
        assignments2 = [];
      }
      const enrichedAssignments = await Promise.all(assignments2.map(async (assignment) => {
        const subject = await storage.getSubject(assignment.subjectId);
        return { ...assignment, subject };
      }));
      res.json(enrichedAssignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });
  app2.post("/api/assignments", authenticate, authorize(["teacher"]), async (req, res) => {
    try {
      const assignmentData = insertAssignmentSchema.parse({
        ...req.body,
        teacherId: req.user.teacherId
      });
      const assignment = await storage.createAssignment(assignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ message: "Invalid assignment data" });
    }
  });
  app2.get("/api/notices", authenticate, async (req, res) => {
    try {
      let notices2;
      if (req.user.role === "admin") {
        notices2 = await storage.getAllNotices();
      } else {
        notices2 = await storage.getNoticesByAudience(req.user.role);
      }
      res.json(notices2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });
  app2.post("/api/notices", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    try {
      const noticeData = insertNoticeSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const notice = await storage.createNotice(noticeData);
      res.status(201).json(notice);
    } catch (error) {
      res.status(400).json({ message: "Invalid notice data" });
    }
  });
  app2.post("/api/feedback", authenticate, authorize(["student"]), async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        studentId: req.user.studentId
      });
      const feedback2 = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback2);
    } catch (error) {
      res.status(400).json({ message: "Invalid feedback data" });
    }
  });
  app2.get("/api/student/profile", authenticate, authorize(["student"]), async (req, res) => {
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
          email: user?.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student profile" });
    }
  });
  app2.get("/api/subjects", authenticate, async (req, res) => {
    try {
      const subjects2 = await storage.getAllSubjects();
      res.json(subjects2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });
  app2.get("/api/classes", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    try {
      let classes2;
      if (req.user.role === "teacher" && req.user.teacherId) {
        classes2 = await storage.getClassesByTeacher(req.user.teacherId);
      } else {
        const allDays = [0, 1, 2, 3, 4, 5, 6];
        const allClasses = await Promise.all(allDays.map((day) => storage.getClassesByDay(day)));
        classes2 = allClasses.flat();
      }
      const enrichedClasses = await Promise.all(classes2.map(async (cls) => {
        const subject = await storage.getSubject(cls.subjectId);
        return { ...cls, subject };
      }));
      res.json(enrichedClasses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
