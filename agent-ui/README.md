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
 
## Prerequisites
- Next.js project
- Access to widget files (`main.js` and `main.css`)
- Valid widget ID from the chatbot service

## Integration Steps

### 1. Add Widget Files
Place the widget files in your public directory:
```
public/
  agent-ui/
    static/
      css/
        main.css
      js/
        main.js
```

### 2. Update _document.tsx
Add the following code to your `pages/_document.tsx`:
```tsx
<Head>
  <link
    rel="stylesheet"
    href="/agent-ui/static/css/main.css"
  />
  <script
    src="/agent-ui/static/js/main.js"
    type="text/javascript"
    async
  ></script>
</Head>
<body>
  <Main />
  <NextScript />
  <div id="chatbot-widget"></div>
</body>
```

### 3. Initialize the Widget
Add the following code to your `pages/_app.tsx`:
```tsx
const initChat = () => {
  if (!window.initChatUI) {
    setTimeout(initChat, 1000);
    return;
  }

  const chatbotWidget = document.getElementById("chatbot-widget");
  if (chatbotWidget && !isInitialized) {
    window.initChatUI(
      "chatbot-widget",
      "YOUR_WIDGET_ID",
      "left",
      "Welcome Message"
    );
    isInitialized = true;
  }
};

useEffect(() => {
  initChat();
  return () => {
    isInitialized = false;
  };
}, []);
```

## Configuration Parameters
- `chatbot-widget`: Widget container ID
- `YOUR_WIDGET_ID`: Your unique widget identifier
- `left`: Widget position (can be 'left' or 'right')
- `Welcome Message`: Custom welcome message for users

## Notes
- The widget will automatically initialize when the page loads
- Make sure to replace `YOUR_WIDGET_ID` with your actual widget ID
- The widget position can be customized by changing the third parameter 