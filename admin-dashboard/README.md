# AI Chatbot Management Dashboard

## Overview
A sophisticated Next.js-based admin dashboard for creating and managing multiple AI chatbots enhanced with RAG (Retrieval-Augmented Generation) capabilities. This platform enables users to create customized chatbots, upload relevant documents for knowledge enhancement, and monitor chat interactions effectively.

## Key Features

### Chatbot Management
- Create and manage multiple AI chatbots
- Customize each chatbot's behavior and settings
- Upload and manage multiple documents for RAG implementation

### Document Management
- Upload various document types (PDF, TXT, DOCX)
- Organize documents by chatbot
- Manage document processing status

### Conversation Monitoring
- View real-time chat sessions
- Access conversation history

## Technical Stack
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for modern UI
- React Query for state management
- RESTful API integration

## Project Structure
```
admin-dashboard/
├── app/
│   ├── agents/           # Chatbot management pages
│   ├── components/       # Reusable UI components
│   ├── design-system/   # UI component library
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── services/        # API integration services
│   └── types/           # TypeScript definitions
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Access to backend API services

 


Start development server:
```bash
npm run dev
```

Visit http://localhost:3000 to access the dashboard.

## Usage Guide

### Creating a New Chatbot
1. Click "Create New Agent"
2. Configure basic settings:
   - Name and upload documents


### Monitoring Conversations
1. View active and historical chats

## API Integration
The dashboard connects to backend services for:
- Chatbot creation and management
- Document processing and RAG implementation
- Conversation handling
- Analytics data retrieval


## Support and Documentation
For technical support or questions:
- Create an issue in the repository
- Contact technical support team
- Refer to API documentation

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Submit a pull request
