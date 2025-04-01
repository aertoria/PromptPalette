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
  updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined>;
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
      // Domain Topics
      { name: "Domain Topic: Ditto Project" },
      { name: "Domain Topic: Mariner Project" },
      
      // Utilities
      { name: "Utility: Connecting Prompts" },
      { name: "Utility: Make Concise" },
      { name: "Utility: Error Handling" },
      { name: "Utility: Format Output" }
    ];
    
    categories.forEach(cat => this.createCategory(cat));
    
    // Add default templates
    const templates = [
      { name: "RLHF Template", content: "This is a template for Reinforcement Learning from Human Feedback prompts." },
      { name: "Persona Creator", content: "Use this template to create a persona for your AI assistant." }
    ];
    
    templates.forEach(template => this.createTemplate(template));
    
    // Calculate IDs based on the updated category list
    const dittoProjectId = 1; // "Domain Topic: Ditto Project"
    const marinerProjectId = 2; // "Domain Topic: Mariner Project"
    const connectingPromptsId = 3; // "Utility: Connecting Prompts"
    const makeConciseId = 4; // "Utility: Make Concise"
    const errorHandlingId = 5; // "Utility: Error Handling"
    const formatOutputId = 6; // "Utility: Format Output"
    
    const prompts = [
      // Ditto Project Prompts
      {
        title: "Context about Ditto Proto call",
        content: `service LabsDittoService {
  // Checks connections to servers, and re-initializes backends if necessary.
  rpc Warmup(WarmupRequest) returns (WarmupResponse) {
    option deadline = 240.0;
  }

  // Returns a list of base models, and their availability.
  rpc GetStatus(GetStatusRequest) returns (GetStatusResponse) {
    option deadline = 120.0;
  }

  // Trains a LoRA SFT or DPO model based on examples in request.
  rpc TrainModel(TrainModelRequest) returns (TrainModelResponse) {
    // errors: INVALID_ARGUMENT, UNAVAILABLE
    option deadline = 120.0;
  }

  // Deletes a user model from CNS and UserModels table.
  rpc DeleteModel(DeleteModelRequest) returns (DeleteModelResponse) {
    // errors: INVALID_ARGUMENT
    option deadline = 120.0;
  }

  // Returns model response from base model or user model.
  rpc Generate(GenerateRequest) returns (GenerateResponse) {
    // errors: INVALID_ARGUMENT, UNAVAILABLE
    option deadline = 120.0;
  }
}`,
        categoryId: dittoProjectId,
        tags: ["Protocol", "API"]
      },

      // Mariner Project Prompts
      {
        title: "Mariner VM Debugger Context",
        content: "This prompt provides context about the Mariner VM debugger functionality and integration points.",
        categoryId: marinerProjectId,
        tags: ["VM", "Debugger"]
      },
      
      // Connecting Prompts Utilities
      {
        title: "Context Transition",
        content: "Based on the information above, let's now focus on [TOPIC].",
        categoryId: connectingPromptsId,
        tags: ["Transition"]
      },
      {
        title: "Logical Bridge",
        content: "To connect these ideas, consider the following relationship between [CONCEPT A] and [CONCEPT B].",
        categoryId: connectingPromptsId,
        tags: ["Connection"]
      },
      {
        title: "Context Setting",
        content: "Below is context you should consider carefully:",
        categoryId: connectingPromptsId,
        tags: ["Context", "Introduction"]
      },
      {
        title: "Background Information",
        content: "Here's some important background:",
        categoryId: connectingPromptsId,
        tags: ["Context", "Background"]
      },
      {
        title: "Careful Consideration",
        content: "Consider the following information carefully:",
        categoryId: connectingPromptsId,
        tags: ["Context", "Attention"]
      },
      {
        title: "Verification Warning",
        content: "Make sure you carefully verify the details.",
        categoryId: connectingPromptsId,
        tags: ["Warning", "Verification"]
      },
      {
        title: "Accuracy Emphasis",
        content: "Pay special attention to accuracy and precision.",
        categoryId: connectingPromptsId,
        tags: ["Warning", "Accuracy"]
      },
      {
        title: "Thorough Check",
        content: "Check thoroughly before responding.",
        categoryId: connectingPromptsId,
        tags: ["Warning", "Thoroughness"]
      },
      {
        title: "Clear Response",
        content: "Respond clearly and concisely.",
        categoryId: connectingPromptsId,
        tags: ["Clarity", "Instructions"]
      },
      {
        title: "Step-by-Step Response",
        content: "Answer step-by-step.",
        categoryId: connectingPromptsId,
        tags: ["Structure", "Instructions"]
      },
      {
        title: "Specific Response",
        content: "Be as specific as possible.",
        categoryId: connectingPromptsId,
        tags: ["Clarity", "Specificity"]
      },
      {
        title: "Logic Verification",
        content: "Double-check your logic before finalizing your answer.",
        categoryId: connectingPromptsId,
        tags: ["Critical", "Verification"]
      },
      {
        title: "No Assumptions",
        content: "Avoid assumptions; rely strictly on provided context.",
        categoryId: connectingPromptsId,
        tags: ["Critical", "Accuracy"]
      },
      {
        title: "Critical Evaluation",
        content: "Evaluate the information carefully before you answer.",
        categoryId: connectingPromptsId,
        tags: ["Analysis", "Evaluation"]
      },
      {
        title: "Comprehensive Analysis",
        content: "Analyze critically and comprehensively.",
        categoryId: connectingPromptsId,
        tags: ["Analysis", "Comprehensiveness"]
      },
      {
        title: "Code Review",
        content: "Review the code carefully for any errors or improvements.",
        categoryId: connectingPromptsId,
        tags: ["Technical", "Review"]
      },
      {
        title: "Solution Validation",
        content: "Validate the solution thoroughly.",
        categoryId: connectingPromptsId,
        tags: ["Technical", "Validation"]
      },
      {
        title: "Structured Response",
        content: "Provide the answer structured into clear sections.",
        categoryId: connectingPromptsId,
        tags: ["Organization", "Structure"]
      },
      {
        title: "List Organization",
        content: "Include numbered or bulleted lists for clarity.",
        categoryId: connectingPromptsId,
        tags: ["Organization", "Lists"]
      },
      {
        title: "Building Upon",
        content: "Building upon the above…",
        categoryId: connectingPromptsId,
        tags: ["Connection", "Continuation"]
      },
      {
        title: "Context Alignment",
        content: "In line with the context provided…",
        categoryId: connectingPromptsId,
        tags: ["Connection", "Context"]
      },
      {
        title: "Previous Details",
        content: "Given the details shared earlier…",
        categoryId: connectingPromptsId,
        tags: ["Connection", "Reference"]
      },
      
      // Make Concise Utilities
      {
        title: "Brevity Instruction",
        content: "Express the above in the most concise way possible, focusing only on essential information.",
        categoryId: makeConciseId,
        tags: ["Brevity"]
      },
      {
        title: "Bullet Point Format",
        content: "Summarize the key points from above in a bullet point list with no more than 5 items.",
        categoryId: makeConciseId,
        tags: ["Format"]
      },
      
      // Error Handling Utilities
      {
        title: "Clarification Request",
        content: "If you encounter ambiguity or missing information, please indicate what specific details you need to proceed.",
        categoryId: errorHandlingId,
        tags: ["Clarification"]
      },
      {
        title: "Fallback Response",
        content: "If unable to complete the request as described, provide an explanation of limitations and suggest alternative approaches.",
        categoryId: errorHandlingId,
        tags: ["Fallback"]
      },
      
      // Format Output Utilities
      {
        title: "JSON Structure",
        content: "Format your response as a valid JSON object with the following structure: [STRUCTURE]",
        categoryId: formatOutputId,
        tags: ["JSON"]
      },
      {
        title: "Markdown Formatting",
        content: "Present your response using Markdown formatting. Use headers for sections, code blocks for examples, and bullet points for lists.",
        categoryId: formatOutputId,
        tags: ["Markdown"]
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
  
  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categoriesStore.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory: Category = {
      ...existingCategory,
      name: data.name ?? existingCategory.name,
    };
    
    this.categoriesStore.set(id, updatedCategory);
    return updatedCategory;
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
    const tags = Array.isArray(data.tags) ? data.tags : [];
    
    const prompt: Prompt = { 
      id, 
      title: data.title,
      content: data.content,
      categoryId: data.categoryId ?? null, // Ensure it's not undefined
      tags: tags,
      createdAt: now 
    };
    this.promptsStore.set(id, prompt);
    return prompt;
  }
  
  async updatePrompt(id: number, data: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const existingPrompt = this.promptsStore.get(id);
    if (!existingPrompt) return undefined;
    
    const tags = Array.isArray(data.tags) ? data.tags : existingPrompt.tags;
    
    const updatedPrompt: Prompt = {
      ...existingPrompt,
      title: data.title ?? existingPrompt.title,
      content: data.content ?? existingPrompt.content,
      categoryId: data.categoryId ?? existingPrompt.categoryId,
      tags: tags,
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
    const promptIds = Array.isArray(data.promptIds) ? data.promptIds : [];
    const order = Array.isArray(data.order) ? data.order : [];
    
    const combination: PromptCombination = { 
      id, 
      name: data.name,
      promptIds: promptIds as number[],
      order: order as number[],
      createdAt: now 
    };
    this.promptCombinationsStore.set(id, combination);
    return combination;
  }
  
  async updatePromptCombination(id: number, data: Partial<InsertPromptCombination>): Promise<PromptCombination | undefined> {
    const existingCombination = this.promptCombinationsStore.get(id);
    if (!existingCombination) return undefined;
    
    const promptIds = Array.isArray(data.promptIds) ? data.promptIds : existingCombination.promptIds;
    const order = Array.isArray(data.order) ? data.order : existingCombination.order;
    
    const updatedCombination: PromptCombination = {
      id: existingCombination.id,
      name: data.name ?? existingCombination.name,
      createdAt: existingCombination.createdAt,
      promptIds: promptIds as number[],
      order: order as number[],
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
