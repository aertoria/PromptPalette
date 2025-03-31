import { 
  categories, Category, InsertCategory,
  prompts, Prompt, InsertPrompt,
  promptCombinations, PromptCombination, InsertPromptCombination,
  templates, Template, InsertTemplate
} from "@shared/schema";

export interface IStorage {
  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(data: InsertCategory): Promise<Category>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Prompts
  getAllPrompts(): Promise<Prompt[]>;
  getPromptById(id: number): Promise<Prompt | undefined>;
  getPromptsByCategory(categoryId: number): Promise<Prompt[]>;
  createPrompt(data: InsertPrompt): Promise<Prompt>;
  updatePrompt(id: number, data: Partial<InsertPrompt>): Promise<Prompt | undefined>;
  deletePrompt(id: number): Promise<boolean>;
  
  // Prompt Combinations
  getAllPromptCombinations(): Promise<PromptCombination[]>;
  getPromptCombinationById(id: number): Promise<PromptCombination | undefined>;
  createPromptCombination(data: InsertPromptCombination): Promise<PromptCombination>;
  updatePromptCombination(id: number, data: Partial<InsertPromptCombination>): Promise<PromptCombination | undefined>;
  deletePromptCombination(id: number): Promise<boolean>;
  
  // Templates
  getAllTemplates(): Promise<Template[]>;
  getTemplateById(id: number): Promise<Template | undefined>;
  createTemplate(data: InsertTemplate): Promise<Template>;
}

export class MemStorage implements IStorage {
  private categoriesStore: Map<number, Category>;
  private promptsStore: Map<number, Prompt>;
  private promptCombinationsStore: Map<number, PromptCombination>;
  private templatesStore: Map<number, Template>;
  
  private categoryIdCounter: number;
  private promptIdCounter: number;
  private promptCombinationIdCounter: number;
  private templateIdCounter: number;
  
  constructor() {
    this.categoriesStore = new Map();
    this.promptsStore = new Map();
    this.promptCombinationsStore = new Map();
    this.templatesStore = new Map();
    
    this.categoryIdCounter = 1;
    this.promptIdCounter = 1;
    this.promptCombinationIdCounter = 1;
    this.templateIdCounter = 1;
    
    // Initialize with some default data
    this.initializeDefaults();
  }
  
  private initializeDefaults() {
    // Add default categories
    const categories = [
      { name: "Creative Writing" },
      { name: "Technical Documentation" },
      { name: "Customer Support" }
    ];
    
    categories.forEach(cat => this.createCategory(cat));
    
    // Add default templates
    const templates = [
      { name: "RLHF Template", content: "This is a template for Reinforcement Learning from Human Feedback prompts." },
      { name: "Persona Creator", content: "Use this template to create a persona for your AI assistant." }
    ];
    
    templates.forEach(template => this.createTemplate(template));
    
    // Add default prompts for Customer Support
    const customerSupportId = 3; // Based on the default categories above
    
    const prompts = [
      { 
        title: "Initial Greeting", 
        content: "Hello, thank you for contacting our support team. How can I assist you today?", 
        categoryId: customerSupportId,
        tags: ["Greeting"]
      },
      { 
        title: "Product Question", 
        content: "I understand you have a question about our product. Could you please provide more details about what you're looking for?", 
        categoryId: customerSupportId,
        tags: ["Question"]
      },
      { 
        title: "Issue Resolution", 
        content: "I'll help resolve your issue as quickly as possible. Let me gather some information to better assist you.", 
        categoryId: customerSupportId,
        tags: ["Support"]
      }
    ];
    
    prompts.forEach(prompt => this.createPrompt(prompt));
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categoriesStore.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categoriesStore.get(id);
  }
  
  async createCategory(data: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const now = new Date();
    const category: Category = { id, ...data };
    this.categoriesStore.set(id, category);
    return category;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categoriesStore.delete(id);
  }
  
  // Prompt methods
  async getAllPrompts(): Promise<Prompt[]> {
    return Array.from(this.promptsStore.values());
  }
  
  async getPromptById(id: number): Promise<Prompt | undefined> {
    return this.promptsStore.get(id);
  }
  
  async getPromptsByCategory(categoryId: number): Promise<Prompt[]> {
    return Array.from(this.promptsStore.values())
      .filter(prompt => prompt.categoryId === categoryId);
  }
  
  async createPrompt(data: InsertPrompt): Promise<Prompt> {
    const id = this.promptIdCounter++;
    const now = new Date();
    const prompt: Prompt = { 
      id, 
      ...data,
      tags: data.tags || [],
      createdAt: now 
    };
    this.promptsStore.set(id, prompt);
    return prompt;
  }
  
  async updatePrompt(id: number, data: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const existingPrompt = this.promptsStore.get(id);
    if (!existingPrompt) return undefined;
    
    const updatedPrompt: Prompt = {
      ...existingPrompt,
      ...data,
      tags: data.tags || existingPrompt.tags,
    };
    
    this.promptsStore.set(id, updatedPrompt);
    return updatedPrompt;
  }
  
  async deletePrompt(id: number): Promise<boolean> {
    return this.promptsStore.delete(id);
  }
  
  // Prompt Combination methods
  async getAllPromptCombinations(): Promise<PromptCombination[]> {
    return Array.from(this.promptCombinationsStore.values());
  }
  
  async getPromptCombinationById(id: number): Promise<PromptCombination | undefined> {
    return this.promptCombinationsStore.get(id);
  }
  
  async createPromptCombination(data: InsertPromptCombination): Promise<PromptCombination> {
    const id = this.promptCombinationIdCounter++;
    const now = new Date();
    const combination: PromptCombination = { 
      id, 
      ...data,
      createdAt: now 
    };
    this.promptCombinationsStore.set(id, combination);
    return combination;
  }
  
  async updatePromptCombination(id: number, data: Partial<InsertPromptCombination>): Promise<PromptCombination | undefined> {
    const existingCombination = this.promptCombinationsStore.get(id);
    if (!existingCombination) return undefined;
    
    const updatedCombination: PromptCombination = {
      ...existingCombination,
      ...data,
      promptIds: data.promptIds || existingCombination.promptIds,
      order: data.order || existingCombination.order,
    };
    
    this.promptCombinationsStore.set(id, updatedCombination);
    return updatedCombination;
  }
  
  async deletePromptCombination(id: number): Promise<boolean> {
    return this.promptCombinationsStore.delete(id);
  }
  
  // Template methods
  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templatesStore.values());
  }
  
  async getTemplateById(id: number): Promise<Template | undefined> {
    return this.templatesStore.get(id);
  }
  
  async createTemplate(data: InsertTemplate): Promise<Template> {
    const id = this.templateIdCounter++;
    const template: Template = { id, ...data };
    this.templatesStore.set(id, template);
    return template;
  }
}

export const storage = new MemStorage();
