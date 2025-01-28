# Embeddable AI Chat Widget UI

## Overview
A versatile React-based chat widget that can be embedded into any website to provide AI-powered conversational capabilities. This widget is designed to be highly customizable and can be used for various purposes such as customer support, Q&A systems, or specialized AI assistants.

## Features
- Embeddable chat interface for any website
- Real-time AI-powered responses
- Customizable widget positioning (left/right)
- Responsive design for all devices
- Session management for continuous conversations
- Loading states and error handling
- Welcome message functionality
- Smooth scrolling and message history

## Technical Stack
- React with TypeScript
- Modern React Hooks for state management
- CSS for styling and animations
- RESTful API integration for chat communication

## Project Structure
```
agent-ui/
├── src/
│   ├── api/        # API integration and services
│   ├── components/ # React components including ChatWidget
│   ├── hooks/      # Custom React hooks
│   ├── types/      # TypeScript type definitions
│   └── App.tsx     # Main application component
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation
1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd agent-ui
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
Start the development server:
```bash
npm start
```
The application will be available at http://localhost:3000

### Building for Production
Create a production build:
```bash
npm run build
```

## Usage

### Method 1: Direct Integration
```typescript
import { ChatWidget } from './components/chat/ChatWidget';

function App() {
  return (
    <ChatWidget
      apiKey="your-api-key"
      position="right"
      defaultMessage="Hello! How can I help you today?"
    />
  );
}
```

### Method 2: Embed via Script
Add a container div to your HTML:
```html
<div id="chat-container"></div>
```

Initialize the chat widget:
```javascript
window.initChatUI(
  'chat-container',
  'your-api-key',
  'right',
  'Hello! How can I help you today?'
);
```

## Configuration Options
- `apiKey`: Required. Authentication key for the chat service
- `position`: Optional. Widget position ('left' or 'right', defaults to 'right')
- `defaultMessage`: Optional. Custom welcome message for new sessions
- `containerId`: Required for script embedding. ID of the container element

## Integration Examples

### Customer Support
```javascript
window.initChatUI(
  'support-chat',
  'api-key',
  'right',
  'Welcome to our support! How can I assist you today?'
);
```

### Knowledge Base Q&A
```javascript
window.initChatUI(
  'kb-chat',
  'api-key',
  'left',
  'Ask me anything about our documentation!'
);
```

### Product Assistant
```javascript
window.initChatUI(
  'product-chat',
  'api-key',
  'right',
  'Need help choosing a product? I\'m here to help!'
);
```

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
