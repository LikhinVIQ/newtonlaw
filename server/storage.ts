import { lessons, submissions, users, type Lesson, type InsertLesson, type Submission, type InsertSubmission, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser, passwordHash: string): Promise<User>;
  
  // Lessons
  getLessons(): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLessonCompletion(id: number, completed: boolean): Promise<Lesson | undefined>;
  
  // Submissions
  getSubmissions(lessonId: number): Promise<Submission[]>;
  getSubmission(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmissionGrading(id: number, score: number, feedback: any): Promise<Submission | undefined>;
}

export class MemStorage implements IStorage {
  private lessons: Map<number, Lesson>;
  private submissions: Map<number, Submission>;
  private users: Map<string, User>;
  private currentLessonId: number;
  private currentSubmissionId: number;

  constructor() {
    this.lessons = new Map();
    this.submissions = new Map();
    this.users = new Map();
    this.currentLessonId = 1;
    this.currentSubmissionId = 1;
    
    // Initialize with Newton's laws
    this.initializeLessons();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const userArray = Array.from(this.users.values());
    return userArray.find(user => user.email === email);
  }

  async createUser(userData: InsertUser, passwordHash: string): Promise<User> {
    const user: User = {
      id: this.users.size + 1,
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      passwordHash,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id.toString(), user);
    return user;
  }

  private initializeLessons() {
    const newtonLaws = [
      {
        title: "Newton's First Law of Motion",
        lawNumber: 1,
        theory: "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force. This is also known as the Law of Inertia.",
        examples: [
          {
            title: "Car Crash",
            description: "When a car suddenly stops, passengers continue moving forward due to inertia until the seatbelt applies a force to stop them."
          },
          {
            title: "Hockey Puck",
            description: "A hockey puck glides across the ice and continues moving until friction and other forces gradually slow it down."
          },
          {
            title: "Tablecloth Trick",
            description: "Pulling a tablecloth quickly from under dishes leaves the dishes in place due to their inertia."
          }
        ],
        completed: true
      },
      {
        title: "Newton's Second Law of Motion",
        lawNumber: 2,
        theory: "The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. This is expressed as F = ma (Force equals mass times acceleration).",
        examples: [
          {
            title: "Pushing a Shopping Cart",
            description: "The harder you push a shopping cart (more force), the faster it accelerates. A full cart (more mass) requires more force to achieve the same acceleration."
          },
          {
            title: "Baseball Pitching",
            description: "A pitcher applies force to accelerate the baseball. The same force applied to a bowling ball would produce much less acceleration due to its greater mass."
          },
          {
            title: "Car Engine",
            description: "A car's engine provides force to accelerate the vehicle. More powerful engines can accelerate heavier cars or accelerate lighter cars more quickly."
          }
        ],
        completed: true
      },
      {
        title: "Newton's Third Law of Motion",
        lawNumber: 3,
        theory: "For every action, there is an equal and opposite reaction. This means that forces always come in pairs - when object A exerts a force on object B, object B simultaneously exerts an equal and opposite force on object A.",
        examples: [
          {
            title: "Rocket Propulsion",
            description: "Hot gases are expelled downward from the rocket engines (action), which pushes the rocket upward with equal force (reaction)."
          },
          {
            title: "Walking",
            description: "You push backward against the ground with your foot (action), and the ground pushes you forward with equal force (reaction)."
          },
          {
            title: "Swimming",
            description: "A swimmer pushes water backward with their arms and legs (action), and the water pushes the swimmer forward (reaction)."
          }
        ],
        completed: false
      }
    ];

    newtonLaws.forEach(law => {
      const lesson: Lesson = {
        id: this.currentLessonId++,
        ...law,
        completed: law.completed ?? false
      };
      this.lessons.set(lesson.id, lesson);
    });
  }

  async getLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).sort((a, b) => a.lawNumber - b.lawNumber);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const lesson: Lesson = {
      id: this.currentLessonId++,
      title: insertLesson.title,
      lawNumber: insertLesson.lawNumber,
      theory: insertLesson.theory,
      examples: insertLesson.examples,
      completed: insertLesson.completed ?? false
    };
    this.lessons.set(lesson.id, lesson);
    return lesson;
  }

  async updateLessonCompletion(id: number, completed: boolean): Promise<Lesson | undefined> {
    const lesson = this.lessons.get(id);
    if (lesson) {
      const updatedLesson = { ...lesson, completed };
      this.lessons.set(id, updatedLesson);
      return updatedLesson;
    }
    return undefined;
  }

  async getSubmissions(lessonId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(s => s.lessonId === lessonId);
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const submission: Submission = {
      id: this.currentSubmissionId++,
      ...insertSubmission,
      score: null,
      feedback: null,
      graded: false
    };
    this.submissions.set(submission.id, submission);
    return submission;
  }

  async updateSubmissionGrading(id: number, score: number, feedback: any): Promise<Submission | undefined> {
    const submission = this.submissions.get(id);
    if (submission) {
      const updatedSubmission = { ...submission, score, feedback, graded: true };
      this.submissions.set(id, updatedSubmission);
      return updatedSubmission;
    }
    return undefined;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(id)));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: InsertUser, passwordHash: string): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash,
        profileImageUrl: userData.profileImageUrl,
      })
      .returning();
    return user;
  }
  async getLessons(): Promise<Lesson[]> {
    const result = await db.select().from(lessons).orderBy(lessons.lawNumber);
    return result;
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson || undefined;
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const [lesson] = await db
      .insert(lessons)
      .values({
        title: insertLesson.title,
        lawNumber: insertLesson.lawNumber,
        theory: insertLesson.theory,
        examples: insertLesson.examples,
        completed: insertLesson.completed ?? false
      })
      .returning();
    return lesson;
  }

  async updateLessonCompletion(id: number, completed: boolean): Promise<Lesson | undefined> {
    const [lesson] = await db
      .update(lessons)
      .set({ completed })
      .where(eq(lessons.id, id))
      .returning();
    return lesson || undefined;
  }

  async getSubmissions(lessonId: number): Promise<Submission[]> {
    const result = await db.select().from(submissions).where(eq(submissions.lessonId, lessonId));
    return result;
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission || undefined;
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db
      .insert(submissions)
      .values({
        lessonId: insertSubmission.lessonId,
        title: insertSubmission.title,
        actionForce: insertSubmission.actionForce,
        reactionForce: insertSubmission.reactionForce,
        explanation: insertSubmission.explanation,
        score: null,
        feedback: null,
        graded: false
      })
      .returning();
    return submission;
  }

  async updateSubmissionGrading(id: number, score: number, feedback: any): Promise<Submission | undefined> {
    const [submission] = await db
      .update(submissions)
      .set({ score, feedback, graded: true })
      .where(eq(submissions.id, id))
      .returning();
    return submission || undefined;
  }
}

export const storage = new DatabaseStorage();
