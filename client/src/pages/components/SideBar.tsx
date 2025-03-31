import { useQuery } from '@tanstack/react-query';
import { Category, Template } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Plus, Folder, FileText, Settings, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SideBarProps {
  isOpen: boolean;
  onToggle: () => void;
  onCategorySelect: (categoryId: number | null) => void;
  currentCategoryId: number | null;
  onCreatePrompt: () => void;
}

export default function SideBar({ 
  isOpen, 
  onToggle, 
  onCategorySelect, 
  currentCategoryId,
  onCreatePrompt 
}: SideBarProps) {
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: promptsData, isLoading: isPromptsLoading } = useQuery<any[]>({
    queryKey: ['/api/prompts'],
  });

  const { data: templatesData, isLoading: isTemplatesLoading } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
  });

  const categorySchema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters"),
    categoryType: z.enum(["domain", "utility"], {
      required_error: "Please select a category type",
    })
  });

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      categoryType: "domain"
    }
  });

  const getCategoryCount = (categoryId: number) => {
    if (!promptsData) return 0;
    return promptsData.filter(prompt => prompt.categoryId === categoryId).length;
  };

  const openAddCategoryDialog = () => setIsAddCategoryDialogOpen(true);
  const closeAddCategoryDialog = () => setIsAddCategoryDialogOpen(false);

  const onSubmit = async (data: z.infer<typeof categorySchema>) => {
    try {
      // Add the appropriate prefix based on category type
      const prefix = data.categoryType === "domain" ? "Domain Topic: " : "Utility: ";
      const categoryName = prefix + data.name;
      
      await apiRequest('POST', '/api/categories', { name: categoryName });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      closeAddCategoryDialog();
      form.reset();
      toast({
        title: "Category created",
        description: `Category "${categoryName}" has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Failed to create category",
        description: "An error occurred while creating the category.",
        variant: "destructive",
      });
    }
  };

  const sidebarClasses = `w-64 bg-white border-r border-gray-200 h-full flex-shrink-0 
    ${isOpen ? 'fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0' : 'hidden md:block'} 
    overflow-y-auto transition-transform duration-200`;

  return (
    <>
      <aside className={sidebarClasses}>
        <div className="p-6">
          {isOpen && (
            <button 
              className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={onToggle}
            >
              <X size={24} />
            </button>
          )}
          
          <div className="flex items-center space-x-2 mb-8">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-2">
              <span className="text-white">✨</span>
            </div>
            <h1 className="text-xl font-bold">ContextManager</h1>
          </div>
          
          <div className="mb-6">
            <Button onClick={onCreatePrompt} className="w-full bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Button>
          </div>
          
          <nav>
            {/* Domain Topics */}
            <div className="mb-6">
              <h2 className="text-xs uppercase font-semibold text-gray-500 mb-2">Domain Topics</h2>
              
              {isCategoriesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {categoriesData?.filter(category => category.name.startsWith('Domain Topic:'))
                    .map((category) => (
                    <div key={category.id} className="mb-3">
                      <div 
                        className={`flex items-center justify-between ${
                          currentCategoryId === category.id 
                            ? 'text-primary font-medium' 
                            : 'text-gray-700 hover:text-primary'
                        } cursor-pointer py-1`}
                        onClick={() => onCategorySelect(category.id)}
                      >
                        <div className="flex items-center">
                          <Folder className="h-4 w-4 mr-2" />
                          <span>{category.name.replace('Domain Topic: ', '')}</span>
                        </div>
                        <span 
                          className={`text-xs ${
                            currentCategoryId === category.id 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-gray-500 bg-gray-100'
                          } px-2 py-0.5 rounded-full`}
                        >
                          {getCategoryCount(category.id)}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            
            {/* Utilities */}
            <div className="mb-6">
              <h2 className="text-xs uppercase font-semibold text-gray-500 mb-2">Utilities</h2>
              
              {isCategoriesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {categoriesData?.filter(category => category.name.startsWith('Utility:'))
                    .map((category) => (
                    <div key={category.id} className="mb-3">
                      <div 
                        className={`flex items-center justify-between ${
                          currentCategoryId === category.id 
                            ? 'text-primary font-medium' 
                            : 'text-gray-700 hover:text-primary'
                        } cursor-pointer py-1`}
                        onClick={() => onCategorySelect(category.id)}
                      >
                        <div className="flex items-center">
                          <Folder className="h-4 w-4 mr-2" />
                          <span>{category.name.replace('Utility: ', '')}</span>
                        </div>
                        <span 
                          className={`text-xs ${
                            currentCategoryId === category.id 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-gray-500 bg-gray-100'
                          } px-2 py-0.5 rounded-full`}
                        >
                          {getCategoryCount(category.id)}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              <button 
                className="flex items-center text-sm text-gray-600 hover:text-primary mt-4"
                onClick={openAddCategoryDialog}
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Add Category</span>
              </button>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xs uppercase font-semibold text-gray-500 mb-2">Templates</h2>
              
              {isTemplatesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {templatesData?.map((template) => (
                    <div key={template.id} className="mb-3">
                      <div 
                        className="flex items-center justify-between text-gray-700 hover:text-primary cursor-pointer py-1"
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>{template.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-gray-200 mt-8">
            <div className="flex items-center text-gray-600 hover:text-primary cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              <span>Settings</span>
            </div>
          </div>
        </div>
      </aside>

      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="categoryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="domain">Domain Topic</SelectItem>
                        <SelectItem value="utility">Utility</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the name without the prefix. The appropriate "Domain Topic:" or "Utility:" prefix will be added automatically.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeAddCategoryDialog}>
                  Cancel
                </Button>
                <Button type="submit">Create Category</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
