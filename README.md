# ContextManager

ContextManager is a web application designed to streamline AI prompt creation, management, and optimization through an intuitive, interactive interface. It enables users to create and organize prompts by categories, drag and drop them as needed, and combine different prompts for various use cases.

## Features

- **Prompt Organization**: Organize prompts by categories such as "Domain Topic" and "Utilities"
- **Drag and Drop Interface**: Easily combine and reorder prompts with intuitive drag-and-drop functionality
- **Prompt Composition**: Create complex prompt chains by combining multiple prompts
- **Gemini Integration**: Copy composed prompts to clipboard for easy pasting into Gemini
- **Category Management**: Create, edit, and delete prompt categories

## Quick Start Guide

### Running on Replit

1. **Fork the Repl**
   - Click the "Fork" button to create your own copy of the ContextManager

2. **Start the Application**
   - Click the "Run" button at the top of the Replit interface
   - This will start the application automatically using the pre-configured workflow

3. **Access the Application**
   - The application will be available in the Webview panel on the right side
   - You can also click the "Open in new tab" button to open it in a full browser window

### Running Locally (outside Replit)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/contextmanager.git
   cd contextmanager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   This will start both the backend and frontend servers. The application will be available at http://localhost:5000.

### Deploying to Production

1. **On Replit**
   - Click the "Deploy" button in the top-right corner of the Replit interface
   - Follow the on-screen instructions to deploy your application

2. **Manual Deployment**
   - Build the project:
     ```bash
     npm run build
     ```
   - Start the production server:
     ```bash
     npm start
     ```

## Project Structure

- `client/`: Frontend React application
  - `src/components/`: UI components
  - `src/lib/`: Utility functions and context providers
  - `src/pages/`: Application pages
- `server/`: Backend Express server
  - `index.ts`: Server entry point
  - `routes.ts`: API routes
  - `storage.ts`: Data storage implementation
- `shared/`: Shared TypeScript types and schemas

## Using the Application

1. **Navigate to the application** at [http://localhost:5000](http://localhost:5000) or use the Replit webview

2. **Browse Prompt Categories** in the sidebar
   - **Domain Topics**: Project-specific prompts (Ditto Project, Mariner Project)
   - **Utilities**: Functional prompts (Customer Support, Connecting Prompts, Make Concise, etc.)

3. **View and Edit Prompts**
   - Click on a category to view its prompts in the library
   - Click "+ New Prompt" to add a new prompt to the selected category
   - Use the edit icon (pencil) to modify existing prompts
   - Use the dropdown menu on categories to edit or delete them

4. **Create Prompt Combinations**
   - Drag prompts from the library to the composer area on the right
   - Multiple ways to drag:
     - Click and hold on any part of the prompt card
     - Use the grip handle on the right side of the card
   - Reorder prompts in the composer using:
     - Up/down arrows that appear to the left of each prompt
     - Drag and drop to reposition
   - View the combined content at the bottom of the composer

5. **Use Your Combined Prompts**
   - Click "Send to Gemini" to copy the combined prompt to clipboard
   - The prompt will be formatted properly with each component in sequence
   - You can then paste it directly into Gemini or any other AI tool

6. **Save Prompt Combinations**
   - Enter a name for your combination in the input field
   - Click "Save Combination" to store it for future use
   - Saved combinations can be accessed through the templates section

7. **Usage Example**:
   - Select "Domain Topic: Ditto Project" to view technical context
   - Drag the "Context about Ditto Proto call" to the composer
   - Select "Utility: Make Concise" category
   - Add "Brevity Instruction" prompt to the composer
   - The combined prompt now has technical context followed by instructions to be concise
   - Copy this to Gemini for more focused and contextual responses

## Troubleshooting

- If you encounter any issues with the application, try:
  - Refreshing the browser
  - Restarting the development server
  - Clearing your browser cache
  - Checking the console for error messages

### Known Issues and Fixes

- **Null/Undefined Content**: The application has safeguards to handle prompts with undefined or null content.
  - The DraggablePromptItem component includes null checks before accessing content.length
  - A fallback message "No content available" is shown if content is missing
  - All potentially unsafe operations (like clipboard copying) are protected with conditional checks

- **Category Management**: When deleting a category, any prompts associated with it will become uncategorized rather than being deleted to prevent data loss.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Powered by Ditto