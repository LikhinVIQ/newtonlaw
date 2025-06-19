import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gradePhysicsExample } from "./services/openai";
import { submitExampleSchema, loginSchema, registerSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import passport from "passport";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      // Remove password hash from response
      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);
      
      // Create user
      const user = await storage.createUser(validatedData, passwordHash);
      
      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        const { passwordHash, ...userResponse } = user;
        res.status(201).json(userResponse);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ message: "Authentication error" });
        }
        if (!user) {
          return res.status(401).json({ message: info.message || "Invalid credentials" });
        }
        
        req.login(user, (err) => {
          if (err) {
            return res.status(500).json({ message: "Login failed" });
          }
          const { passwordHash, ...userResponse } = user;
          res.json(userResponse);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get all lessons
  app.get("/api/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessons();
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  // Get specific lesson
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lesson = await storage.getLesson(id);
      
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // Update lesson completion
  app.patch("/api/lessons/:id/completion", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { completed } = req.body;
      
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ message: "Completed must be a boolean" });
      }
      
      const lesson = await storage.updateLessonCompletion(id, completed);
      
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to update lesson" });
    }
  });

  // Get submissions for a lesson
  app.get("/api/lessons/:id/submissions", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const submissions = await storage.getSubmissions(lessonId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Submit example for grading
  app.post("/api/submissions", async (req, res) => {
    try {
      const validatedData = submitExampleSchema.parse(req.body);
      
      // Get the lesson to determine which law we're grading
      const lesson = await storage.getLesson(validatedData.lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      // Create submission
      const submission = await storage.createSubmission(validatedData);
      
      // Grade with OpenAI
      const { score, feedback } = await gradePhysicsExample(
        lesson.lawNumber,
        validatedData.title,
        validatedData.actionForce,
        validatedData.reactionForce,
        validatedData.explanation
      );
      
      // Update submission with grading results
      const gradedSubmission = await storage.updateSubmissionGrading(
        submission.id,
        score,
        feedback
      );
      
      // Mark lesson as completed if score is good
      if (score >= 7) {
        await storage.updateLessonCompletion(validatedData.lessonId, true);
      }
      
      res.json(gradedSubmission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid submission data",
          errors: error.errors 
        });
      }
      
      console.error("Submission error:", error);
      res.status(500).json({ message: "Failed to process submission" });
    }
  });

  // Get specific submission
  app.get("/api/submissions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const submission = await storage.getSubmission(id);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
