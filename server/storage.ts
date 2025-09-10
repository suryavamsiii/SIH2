import { 
  type User, type Student, type Teacher, type Subject, type Class, 
  type Attendance, type Assignment, type Submission, type Notice, type Feedback,
  type InsertUser, type InsertStudent, type InsertTeacher, type InsertSubject,
  type InsertClass, type InsertAttendance, type InsertAssignment, type InsertSubmission,
  type InsertNotice, type InsertFeedback
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByUserId(userId: string): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined>;

  // Teacher operations
  getTeacher(id: string): Promise<Teacher | undefined>;
  getTeacherByUserId(userId: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher | undefined>;

  // Subject operations
  getSubject(id: string): Promise<Subject | undefined>;
  getAllSubjects(): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | undefined>;

  // Class operations
  getClass(id: string): Promise<Class | undefined>;
  getClassesByDay(dayOfWeek: number): Promise<Class[]>;
  getClassesByTeacher(teacherId: string): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, updates: Partial<Class>): Promise<Class | undefined>;
  deleteClass(id: string): Promise<boolean>;

  // Attendance operations
  getAttendance(id: string): Promise<Attendance | undefined>;
  getAttendanceByStudent(studentId: string): Promise<Attendance[]>;
  getAttendanceByClass(classId: string, date: Date): Promise<Attendance[]>;
  markAttendance(attendance: InsertAttendance): Promise<Attendance>;

  // Assignment operations
  getAssignment(id: string): Promise<Assignment | undefined>;
  getAssignmentsBySubject(subjectId: string): Promise<Assignment[]>;
  getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | undefined>;

  // Submission operations
  getSubmission(id: string): Promise<Submission | undefined>;
  getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]>;
  getSubmissionsByStudent(studentId: string): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission | undefined>;

  // Notice operations
  getNotice(id: string): Promise<Notice | undefined>;
  getAllNotices(): Promise<Notice[]>;
  getNoticesByAudience(audience: string): Promise<Notice[]>;
  createNotice(notice: InsertNotice): Promise<Notice>;
  updateNotice(id: string, updates: Partial<Notice>): Promise<Notice | undefined>;
  deleteNotice(id: string): Promise<boolean>;

  // Feedback operations
  getFeedback(id: string): Promise<Feedback | undefined>;
  getFeedbackBySubject(subjectId: string): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private students: Map<string, Student> = new Map();
  private teachers: Map<string, Teacher> = new Map();
  private subjects: Map<string, Subject> = new Map();
  private classes: Map<string, Class> = new Map();
  private attendance: Map<string, Attendance> = new Map();
  private assignments: Map<string, Assignment> = new Map();
  private submissions: Map<string, Submission> = new Map();
  private notices: Map<string, Notice> = new Map();
  private feedbacks: Map<string, Feedback> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create sample admin user
    const adminUser: User = {
      id: "admin-1",
      username: "admin",
      password: "admin123", // In production, this would be hashed
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      email: "admin@edutrack.com",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample teacher
    const teacherUser: User = {
      id: "teacher-1",
      username: "sarah.johnson",
      password: "teacher123",
      role: "teacher",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@edutrack.com",
      createdAt: new Date(),
    };
    this.users.set(teacherUser.id, teacherUser);

    const teacher: Teacher = {
      id: "t-1",
      userId: "teacher-1",
      teacherId: "T001",
      department: "Computer Science",
      subjects: ["Data Structures", "Algorithms"],
    };
    this.teachers.set(teacher.id, teacher);

    // Create sample student
    const studentUser: User = {
      id: "student-1",
      username: "rahul.sharma",
      password: "student123",
      role: "student",
      firstName: "Rahul",
      lastName: "Sharma",
      email: "rahul.sharma@student.edutrack.com",
      createdAt: new Date(),
    };
    this.users.set(studentUser.id, studentUser);

    const student: Student = {
      id: "s-1",
      userId: "student-1",
      studentId: "CS2021001",
      program: "B.Tech Computer Science",
      year: 3,
      semester: 6,
      qrCode: "CS2021001-QR",
    };
    this.students.set(student.id, student);

    // Create sample subject
    const subject: Subject = {
      id: "sub-1",
      name: "Data Structures & Algorithms",
      code: "CS301",
      credits: 4,
      department: "Computer Science",
    };
    this.subjects.set(subject.id, subject);

    // Create sample class
    const classData: Class = {
      id: "class-1",
      subjectId: "sub-1",
      teacherId: "t-1",
      dayOfWeek: 1, // Monday
      startTime: "10:30",
      endTime: "12:00",
      room: "204",
      building: "Science Block",
    };
    this.classes.set(classData.id, classData);

    // Create sample assignment
    const assignment: Assignment = {
      id: "assign-1",
      title: "Binary Tree Implementation",
      description: "Implement a binary search tree with insert, delete, and search operations",
      subjectId: "sub-1",
      teacherId: "t-1",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      maxMarks: 100,
      attachments: [],
      createdAt: new Date(),
    };
    this.assignments.set(assignment.id, assignment);

    // Create sample notice
    const notice: Notice = {
      id: "notice-1",
      title: "Mid-term Exams Schedule",
      content: "Exams starting from March 25th. Check detailed schedule on portal.",
      type: "exam",
      priority: "high",
      targetAudience: ["students"],
      createdBy: "admin-1",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    };
    this.notices.set(notice.id, notice);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // Student operations
  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByUserId(userId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(student => student.userId === userId);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(student => student.studentId === studentId);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const qrCode = `${insertStudent.studentId}-${randomUUID().substring(0, 8)}`;
    const student: Student = { 
      ...insertStudent, 
      id,
      qrCode,
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    const updated = { ...student, ...updates };
    this.students.set(id, updated);
    return updated;
  }

  // Teacher operations
  async getTeacher(id: string): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async getTeacherByUserId(userId: string): Promise<Teacher | undefined> {
    return Array.from(this.teachers.values()).find(teacher => teacher.userId === userId);
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const id = randomUUID();
    const teacher: Teacher = { 
      ...insertTeacher, 
      id,
      subjects: insertTeacher.subjects || null,
    };
    this.teachers.set(id, teacher);
    return teacher;
  }

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher | undefined> {
    const teacher = this.teachers.get(id);
    if (!teacher) return undefined;
    const updated = { ...teacher, ...updates };
    this.teachers.set(id, updated);
    return updated;
  }

  // Subject operations
  async getSubject(id: string): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = randomUUID();
    const subject: Subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | undefined> {
    const subject = this.subjects.get(id);
    if (!subject) return undefined;
    const updated = { ...subject, ...updates };
    this.subjects.set(id, updated);
    return updated;
  }

  // Class operations
  async getClass(id: string): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async getClassesByDay(dayOfWeek: number): Promise<Class[]> {
    return Array.from(this.classes.values()).filter(cls => cls.dayOfWeek === dayOfWeek);
  }

  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    return Array.from(this.classes.values()).filter(cls => cls.teacherId === teacherId);
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const id = randomUUID();
    const classData: Class = { ...insertClass, id };
    this.classes.set(id, classData);
    return classData;
  }

  async updateClass(id: string, updates: Partial<Class>): Promise<Class | undefined> {
    const classData = this.classes.get(id);
    if (!classData) return undefined;
    const updated = { ...classData, ...updates };
    this.classes.set(id, updated);
    return updated;
  }

  async deleteClass(id: string): Promise<boolean> {
    return this.classes.delete(id);
  }

  // Attendance operations
  async getAttendance(id: string): Promise<Attendance | undefined> {
    return this.attendance.get(id);
  }

  async getAttendanceByStudent(studentId: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(att => att.studentId === studentId);
  }

  async getAttendanceByClass(classId: string, date: Date): Promise<Attendance[]> {
    const dateStr = date.toDateString();
    return Array.from(this.attendance.values()).filter(att => 
      att.classId === classId && att.date.toDateString() === dateStr
    );
  }

  async markAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const attendance: Attendance = { 
      ...insertAttendance, 
      id,
      markedAt: new Date(),
    };
    this.attendance.set(id, attendance);
    return attendance;
  }

  // Assignment operations
  async getAssignment(id: string): Promise<Assignment | undefined> {
    return this.assignments.get(id);
  }

  async getAssignmentsBySubject(subjectId: string): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).filter(assignment => assignment.subjectId === subjectId);
  }

  async getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).filter(assignment => assignment.teacherId === teacherId);
  }

  async createAssignment(insertAssignment: InsertAssignment): Promise<Assignment> {
    const id = randomUUID();
    const assignment: Assignment = { 
      ...insertAssignment, 
      id,
      description: insertAssignment.description || null,
      maxMarks: insertAssignment.maxMarks || null,
      attachments: insertAssignment.attachments || null,
      createdAt: new Date(),
    };
    this.assignments.set(id, assignment);
    return assignment;
  }

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | undefined> {
    const assignment = this.assignments.get(id);
    if (!assignment) return undefined;
    const updated = { ...assignment, ...updates };
    this.assignments.set(id, updated);
    return updated;
  }

  // Submission operations
  async getSubmission(id: string): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(sub => sub.assignmentId === assignmentId);
  }

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(sub => sub.studentId === studentId);
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = randomUUID();
    const submission: Submission = { 
      ...insertSubmission, 
      id,
      content: insertSubmission.content || null,
      attachments: insertSubmission.attachments || null,
      feedback: insertSubmission.feedback || null,
      marks: insertSubmission.marks || null,
      submittedAt: new Date(),
    };
    this.submissions.set(id, submission);
    return submission;
  }

  async updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission | undefined> {
    const submission = this.submissions.get(id);
    if (!submission) return undefined;
    const updated = { ...submission, ...updates };
    this.submissions.set(id, updated);
    return updated;
  }

  // Notice operations
  async getNotice(id: string): Promise<Notice | undefined> {
    return this.notices.get(id);
  }

  async getAllNotices(): Promise<Notice[]> {
    return Array.from(this.notices.values()).sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
  }

  async getNoticesByAudience(audience: string): Promise<Notice[]> {
    return Array.from(this.notices.values())
      .filter(notice => notice.targetAudience?.includes(audience) || notice.targetAudience?.includes("all"))
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime;
      });
  }

  async createNotice(insertNotice: InsertNotice): Promise<Notice> {
    const id = randomUUID();
    const notice: Notice = { 
      ...insertNotice, 
      id,
      targetAudience: insertNotice.targetAudience || null,
      expiresAt: insertNotice.expiresAt || null,
      createdAt: new Date(),
    };
    this.notices.set(id, notice);
    return notice;
  }

  async updateNotice(id: string, updates: Partial<Notice>): Promise<Notice | undefined> {
    const notice = this.notices.get(id);
    if (!notice) return undefined;
    const updated = { ...notice, ...updates };
    this.notices.set(id, updated);
    return updated;
  }

  async deleteNotice(id: string): Promise<boolean> {
    return this.notices.delete(id);
  }

  // Feedback operations
  async getFeedback(id: string): Promise<Feedback | undefined> {
    return this.feedbacks.get(id);
  }

  async getFeedbackBySubject(subjectId: string): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values()).filter(feedback => feedback.subjectId === subjectId);
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedback: Feedback = { 
      ...insertFeedback, 
      id,
      teacherId: insertFeedback.teacherId || null,
      subjectId: insertFeedback.subjectId || null,
      comments: insertFeedback.comments || null,
      anonymous: insertFeedback.anonymous ?? null,
      createdAt: new Date(),
    };
    this.feedbacks.set(id, feedback);
    return feedback;
  }
}

export const storage = new MemStorage();
