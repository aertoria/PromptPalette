import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow()
});

export const promptCombinations = pgTable("prompt_combinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  promptIds: integer("prompt_ids").array(),
  order: jsonb("order").$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow()
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  content: text("content").notNull(),
});

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
});

export const insertPromptSchema = createInsertSchema(prompts).pick({
  title: true,
  content: true,
  categoryId: true,
  tags: true,
});

export const insertPromptCombinationSchema = createInsertSchema(promptCombinations).pick({
  name: true,
  promptIds: true,
  order: true,
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  content: true,
});

// Type definitions
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;

export type PromptCombination = typeof promptCombinations.$inferSelect;
export type InsertPromptCombination = z.infer<typeof insertPromptCombinationSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

// Extended validation schemas for forms
export const promptValidationSchema = insertPromptSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(5, "Content must be at least 5 characters"),
  tags: z.array(z.string()).optional(),
});

export const categoryValidationSchema = insertCategorySchema.extend({
  name: z.string().min(2, "Category name must be at least 2 characters"),
});
