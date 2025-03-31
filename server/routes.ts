import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPromptSchema, insertCategorySchema, 
  insertPromptCombinationSchema, insertTemplateSchema,
  promptValidationSchema, categoryValidationSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // Error handling middleware
  const validateRequest = (schema: z.ZodType<any, any>) => {
    return async (req: Request, res: Response, next: Function) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ 
            message: validationError.message,
            errors: error.errors 
          });
        }
        next(error);
      }
    };
  };

  // Categories Routes
  apiRouter.get("/categories", async (req, res) => {
    const categories = await storage.getAllCategories();
    res.json(categories);
  });
  
  apiRouter.get("/categories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const category = await storage.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  });
  
  apiRouter.post("/categories", validateRequest(categoryValidationSchema), async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  apiRouter.delete("/categories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const success = await storage.deleteCategory(id);
    if (!success) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.status(204).send();
  });
  
  // Prompts Routes
  apiRouter.get("/prompts", async (req, res) => {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    
    let prompts;
    if (categoryId) {
      prompts = await storage.getPromptsByCategory(categoryId);
    } else {
      prompts = await storage.getAllPrompts();
    }
    
    res.json(prompts);
  });
  
  apiRouter.get("/prompts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prompt ID" });
    }
    
    const prompt = await storage.getPromptById(id);
    if (!prompt) {
      return res.status(404).json({ message: "Prompt not found" });
    }
    
    res.json(prompt);
  });
  
  apiRouter.post("/prompts", validateRequest(promptValidationSchema), async (req, res) => {
    try {
      const prompt = await storage.createPrompt(req.body);
      res.status(201).json(prompt);
    } catch (error) {
      res.status(500).json({ message: "Failed to create prompt" });
    }
  });
  
  apiRouter.patch("/prompts/:id", validateRequest(promptValidationSchema.partial()), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prompt ID" });
    }
    
    const updatedPrompt = await storage.updatePrompt(id, req.body);
    if (!updatedPrompt) {
      return res.status(404).json({ message: "Prompt not found" });
    }
    
    res.json(updatedPrompt);
  });
  
  apiRouter.delete("/prompts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prompt ID" });
    }
    
    const success = await storage.deletePrompt(id);
    if (!success) {
      return res.status(404).json({ message: "Prompt not found" });
    }
    
    res.status(204).send();
  });
  
  // Prompt Combinations Routes
  apiRouter.get("/combinations", async (req, res) => {
    const combinations = await storage.getAllPromptCombinations();
    res.json(combinations);
  });
  
  apiRouter.get("/combinations/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid combination ID" });
    }
    
    const combination = await storage.getPromptCombinationById(id);
    if (!combination) {
      return res.status(404).json({ message: "Combination not found" });
    }
    
    res.json(combination);
  });
  
  apiRouter.post("/combinations", validateRequest(insertPromptCombinationSchema), async (req, res) => {
    try {
      const combination = await storage.createPromptCombination(req.body);
      res.status(201).json(combination);
    } catch (error) {
      res.status(500).json({ message: "Failed to create combination" });
    }
  });
  
  apiRouter.patch("/combinations/:id", validateRequest(insertPromptCombinationSchema.partial()), async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid combination ID" });
    }
    
    const updatedCombination = await storage.updatePromptCombination(id, req.body);
    if (!updatedCombination) {
      return res.status(404).json({ message: "Combination not found" });
    }
    
    res.json(updatedCombination);
  });
  
  apiRouter.delete("/combinations/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid combination ID" });
    }
    
    const success = await storage.deletePromptCombination(id);
    if (!success) {
      return res.status(404).json({ message: "Combination not found" });
    }
    
    res.status(204).send();
  });
  
  // Templates Routes
  apiRouter.get("/templates", async (req, res) => {
    const templates = await storage.getAllTemplates();
    res.json(templates);
  });
  
  apiRouter.get("/templates/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    
    const template = await storage.getTemplateById(id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    res.json(template);
  });
  
  apiRouter.post("/templates", validateRequest(insertTemplateSchema), async (req, res) => {
    try {
      const template = await storage.createTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Register API Routes
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
