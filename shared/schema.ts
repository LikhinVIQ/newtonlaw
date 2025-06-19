import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  lawNumber: integer("law_number").notNull(),
  theory: text("theory").notNull(),
  examples: jsonb("examples").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull(),
  title: text("title").notNull(),
  actionForce: text("action_force").notNull(),
  reactionForce: text("reaction_force").notNull(),
  explanation: text("explanation").notNull(),
  score: integer("score"),
  feedback: jsonb("feedback"),
  graded: boolean("graded").notNull().default(false),
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  score: true,
  feedback: true,
  graded: true,
});

export const submitExampleSchema = insertSubmissionSchema.pick({
  lessonId: true,
  title: true,
  actionForce: true,
  reactionForce: true,
  explanation: true,
});

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
export type SubmitExample = z.infer<typeof submitExampleSchema>;

export interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  comments: string;
}
