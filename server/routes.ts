import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gradePhysicsExample } from "./services/openai";
import { submitExampleSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
