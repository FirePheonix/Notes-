# Drawing App Backend

A Node.js/Express backend for the drawing application with Clerk authentication and MongoDB storage.

## Features

- 🔐 **Clerk Authentication** - Secure user authentication
- 📊 **MongoDB Database** - Store user chats and canvas data
- 🎨 **Canvas Data Management** - Complete CRUD operations for drawing elements
- 📱 **Chat System** - Organize drawings into chat-like sessions
- 🚀 **TypeScript** - Type-safe development
- 🔒 **Security** - Rate limiting, CORS, helmet protection
- ✅ **Validation** - Input validation with Zod

## API Endpoints

### Authentication
All API routes require authentication via Clerk.

### Chat Management
- `POST /api/chats` - Create a new chat
- `GET /api/chats` - Get all user chats (with pagination and search)
- `GET /api/chats/:id` - Get a specific chat
- `PUT /api/chats/:id` - Update a chat
- `DELETE /api/chats/:id` - Delete a chat
- `POST /api/chats/:id/elements` - Save canvas elements to a chat

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- Clerk account

### 1. Clone and Install
```bash
cd Server
npm install
```

### 2. Environment Variables
Create a `.env` file:
```env
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/drawing-app

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# CORS
FRONTEND_URL=http://localhost:5173
```

### 3. Setup Clerk
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy the API keys to your `.env` file
4. Configure your allowed origins in Clerk dashboard

### 4. Setup MongoDB
**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 5. Run the Application
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Project Structure
```
Server/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── middleware/
│   │   ├── auth.ts              # Clerk authentication
│   │   ├── errorHandler.ts      # Error handling
│   │   └── validation.ts        # Input validation
│   ├── models/
│   │   └── Chat.ts              # MongoDB chat model
│   ├── routes/
│   │   └── chatRoutes.ts        # Chat API routes
│   ├── services/
│   │   └── chatService.ts       # Business logic
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── validators/
│   │   └── chatValidators.ts    # Zod validation schemas
│   └── server.ts                # Main server file
├── .env.example                 # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Data Models

### Chat Model
```typescript
{
  id: string;
  userId: string;           // Clerk user ID
  title: string;            // Chat title
  elements: Element[];      // Canvas elements
  createdAt: Date;
  updatedAt: Date;
}
```

### Element Model
```typescript
{
  id: string;
  type: Tool;               // rectangle, circle, line, etc.
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  strokeStyle: string;
  roughness: number;
  opacity: number;
  points?: Point[];         // For freehand drawing
  text?: string;            // For text elements
  code?: string;            // For code blocks
  // ... other properties
}
```

## API Examples

### Create a Chat
```bash
curl -X POST http://localhost:3000/api/chats \
  -H "Authorization: Bearer your_clerk_token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Drawing",
    "elements": []
  }'
```

### Get All Chats
```bash
curl -X GET "http://localhost:3000/api/chats?page=1&limit=10" \
  -H "Authorization: Bearer your_clerk_token"
```

### Save Canvas Elements
```bash
curl -X POST http://localhost:3000/api/chats/chat_id/elements \
  -H "Authorization: Bearer your_clerk_token" \
  -H "Content-Type: application/json" \
  -d '{
    "elements": [
      {
        "id": "element_1",
        "type": "rectangle",
        "x": 100,
        "y": 100,
        "width": 200,
        "height": 150,
        "strokeColor": "#000000",
        "backgroundColor": "transparent",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "roughness": 1,
        "opacity": 1,
        "angle": 0,
        "isDeleted": false
      }
    ]
  }'
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for your frontend domain
- **Helmet**: Security headers
- **Input Validation**: All inputs validated with Zod
- **Authentication**: All routes protected with Clerk

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm test
```

## Deployment

1. Set environment variables in your hosting platform
2. Build the application: `npm run build`
3. Start the server: `npm start`

## Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
2. **Clerk Authentication**: Check API keys and allowed origins
3. **CORS Issues**: Update `FRONTEND_URL` in environment variables
4. **Port Conflicts**: Change `PORT` in environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request
