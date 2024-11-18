# Frontend Documentation

## Overview
The growwth partners chat application is a React-based chat interface with authentication features, built using Chakra UI for styling and component design. It provides a seamless user experience for registration, login, and real-time chat interaction with an AI assistant.

## Components Structure

### 1. Authentication Pages

#### Login Page
- **Purpose**: Handles user authentication
- **Features**:
  - Email and password authentication
  - Form validation
  - Error handling with toast notifications
  - Automatic redirection to chat on successful login
  - Loading states during authentication
  - Token storage management

#### Sign Up Page
- **Purpose**: Manages new user registration
- **Features**:
  - User registration with email and password
  - Password strength validation
  - Real-time form validation
  - Success/error notifications
  - Redirect to login after successful registration
  - Loading state management

### 2. Chat Interface

#### ChatBox Component
- **Purpose**: Main chat interface for user-AI interaction
- **Features**:
  - Real-time message display
  - Message streaming support
  - Automatic scrolling to new messages
  - Loading indicators
  - Error handling
  - Responsive design
  - Theme customization

#### Supporting Components
- **ChatInput**: Handles user message input
- **Message**: Displays individual chat messages
- **LoadingIndicator**: Shows processing status
- **ErrorAlert**: Displays error messages

## User Flows

### Authentication Flow
1. User arrives at application
2. Chooses login or signup
3. Completes form with required information
4. System validates input
5. On success:
   - Login: Redirects to chat
   - Signup: Redirects to login
6. On failure: Displays error message

### Chat Flow
1. User enters chat interface
2. Views message history (if any)
3. Enters message in input field
4. Receives streaming response from AI
5. Messages automatically scroll to latest
6. Error handling if message fails

## State Management
- Local state management using React hooks
- Form data handling
- Error state management
- Loading state tracking
- Message history management

## Theme and Styling
- Chakra UI component library
- Responsive design
- Custom theme support
- Dark/light mode compatibility
- Consistent styling across components

## Security Features
1. **Authentication**
   - Token-based authentication
   - Secure token storage
   - Session management

2. **Form Security**
   - Input validation
   - Error handling
   - Loading state protection

## Error Handling
- Form validation errors
- API communication errors
- Network error handling
- User-friendly error messages
- Toast notifications

## Performance Considerations
- Message streaming optimization
- Efficient state updates
- Memoized functions
- Optimized re-renders
- Scroll performance

## Accessibility Features
- Form labels and ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management
- Loading state indicators

## Environment Configuration
### Required Variables
- REACT_APP_API_URL=https://growwth-chat-app.onrender.com

## Best Practices
1. **Code Organization**
   - Component-based architecture
   - Separation of concerns
   - Reusable components
   - Consistent naming conventions

2. **User Experience**
   - Loading indicators
   - Error feedback
   - Form validation
   - Responsive design
   - Intuitive navigation

3. **Performance**
   - Optimized rendering
   - Efficient state management
   - Error boundary implementation
   - Performance monitoring


# AI Chat Assistant API

## 🚀 Overview
A modern backend API for an AI-powered chat application built with Node.js and Express. This application provides secure user authentication and real-time messaging capabilities, integrated with an AI assistant for intelligent conversation handling.

## ✨ Features
- 🔐 Secure user authentication
- 💬 Real-time messaging
- 🤖 AI assistant integration
- 🌐 CORS-enabled API endpoints
- 📦 MongoDB database integration
- 🔄 Stateless architecture

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **AI Integration**: Custom Assistant Implementation

## 📋 Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/bhavnesh1811/growwth-chat-app.git
cd server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5500
JWT_SECRET=your-secret
OPENAI_API_KEY=your-chatgpt-api-key
FRONTEND_URL=your fronend app deployed link || http://localhost:3000
# Add other required environment variables
```

### 4. Start the Server
```bash

npm run start

```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Messages
- `GET /api/messages` - Get user messages
- `POST /api/messages` - Send new message
- Additional message endpoints defined in message routes

## 🔒 Security
- CORS protection
- Request validation
- Secure authentication flow
- Environment variable protection

## 🧪 Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Project Structure
```
├── config/
│   └── db.js
├── data/
│   └── financial_data.json
├── middleware/
│   └── auth.js
├── model/
│   ├── user.model.js
│   └── message.model.js
├── routes/
│   ├── user.route.js
│   └── message.route.js
├── utils/
│   └── assistant.js
│   └── streamhandler.js
├── .env
├── .gitignore
├── index.js
├── package.json
└── README.md
```

## 🚀 Deployment
The application can be deployed to any Node.js hosting platform:

1. Set up environment variables
2. Build the application
3. Start the server
```bash
npm run build
npm start
```

## 📈 Performance Monitoring
- Server health check endpoint: `GET /`
- Database connection monitoring
- API response time tracking

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 🐛 Bug Reports
Please use the GitHub Issues tab to report any bugs. Include:
- Bug description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)

## ✨ Future Enhancements
- [ ] WebSocket integration
- [ ] Enhanced AI capabilities
- [ ] Rate limiting
- [ ] API documentation with Swagger
- [ ] Advanced monitoring
- [ ] Caching layer

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors
- Your Name
- Contributors

## 🙏 Acknowledgments
- Express.js team
- MongoDB team
- Open source community

## 📞 Support
For support, please:
1. Check existing documentation
2. Review closed issues
3. Open a new issue
4. Contact the development team

---
Made with ❤️ by [Your Name/Team]