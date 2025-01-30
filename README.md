# Chat Agent

A comprehensive RAG-based (Retrieval-Augmented Generation) chatbot solution that demonstrates how to effectively implement LLMs with LangChain. What started as an educational project has evolved into a full-featured system with an API, admin dashboard, and embeddable chat widget.

![Admin Dashboard Demo](admin-dashboard/images/Create%20New%20Q%26A%20Agent.mp4)
![Chat Widget Demo](agent-ui/images/agent-ui.mp4)

## Overview

This project provides a complete solution for creating and managing AI-powered chatbots enhanced with document-based knowledge. Users can create multiple chat agents through an admin dashboard, feed them with various document types, and easily integrate them into any website using the provided chat widget.

## Key Features

### Document-Enhanced Chat Agents
- Create multiple chat agents with unique capabilities
- Support for multiple document formats:
  - PDF
  - CSV
  - DOCX
  - EPUB
  - TXT
  - JSON
  - MD
- Automatic document processing and knowledge extraction
- Unique access token generation for each agent

### Admin Dashboard
- User-friendly interface for agent management
- Document upload and management
- Chat session monitoring
- User interaction analytics
- Agent performance metrics

### Embeddable Chat Widget
- Easy integration with any website
- Responsive design
- Real-time chat capabilities
- Customizable positioning and styling

## Project Structure

```
investor-chat-agent/
├── admin-dashboard/    # Next.js admin interface
├── agent-api/         # Express.js backend API
└── agent-ui/          # React-based chat widget
```

## Technical Stack

### Backend (agent-api)
- Node.js & Express.js
- TypeScript
- LangChain for RAG implementation
- OpenAI integration
- Document processing capabilities
- Redis for session management

### Admin Dashboard (admin-dashboard)
- Next.js 14
- TypeScript
- Tailwind CSS
- React Query
- Modern UI components

### Chat Widget (agent-ui)
- React
- TypeScript
- Embeddable design
- Real-time communication

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Redis database
- OpenAI API key
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/investor-chat-agent.git
cd investor-chat-agent
```

2. Install dependencies for each component:
```bash
# Backend API
cd agent-api
npm install

# Admin Dashboard
cd ../admin-dashboard
npm install

# Chat Widget
cd ../agent-ui
npm install
```

3. Configure environment variables for each component (see individual README files for details)

### Usage

1. Start the backend API:
```bash
cd agent-api
npm run dev
```

2. Launch the admin dashboard:
```bash
cd admin-dashboard
npm run dev
```

3. Build the chat widget for integration:
```bash
cd agent-ui
npm run build
```

## Creating and Using Chat Agents

1. Access the admin dashboard
2. Click "Create New Agent"
3. Configure the agent:
   - Set agent name
   - Upload relevant documents
   - Save and receive access token
4. Integrate the chat widget using the provided access token
5. Monitor conversations and analytics through the admin dashboard

## Integration Example

```typescript
// Add the chat widget to your website
const initChat = () => {
  window.initChatUI(
    "chatbot-widget",
    "YOUR_ACCESS_TOKEN",
    "right",
    "Welcome! How can I help you today?"
  );
};
```

## Educational Purpose

This project was created for educational purposes to demonstrate:
- RAG implementation with LangChain
- LLM integration best practices
- Full-stack application architecture
- Real-time chat functionality
- Document processing and knowledge extraction

## Contributing

We welcome contributions! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

Areas for contribution:
- Additional document format support
- Enhanced RAG capabilities
- UI/UX improvements
- Performance optimizations
- Documentation improvements

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for LLM capabilities
- LangChain for RAG framework
- All contributors and supporters

## Support

For questions and support:
- Create an issue in the repository
- Check individual component README files for specific guidance
- Refer to the documentation in each component's directory 