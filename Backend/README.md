# Backend - Chat-WebApplication

Node.js/Express backend for the Chat-WebApplication, featuring real-time messaging with Socket.io, JWT authentication, and MongoDB integration.

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account (for image uploads)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file in Backend/ directory:**
   ```bash
   cp .env.example .env
   ```

3. **Fill in the environment variables in `.env`:**
   ```
   MONGODB_URI=your-mongodb-connection-string
   PORT=5000
   NODE_ENV=development
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   JWT_SECRET=your-secret-key-here
   ```

## Development

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests in watch mode
npm test:watch
```

The backend will be available at `http://localhost:5000` (default PORT).

## Project Structure

```
Backend/
├── src/
│   ├── index.js              # Main entry point, Express setup
│   ├── keepAlive.js          # Keeps server alive (Render)
│   ├── controllers/
│   │   ├── auth.controller.js       # Authentication logic
│   │   └── message.controller.js    # Message handling
│   ├── lib/
│   │   ├── db.js             # MongoDB connection
│   │   ├── socket.js         # Socket.io setup
│   │   ├── cloudinary.js     # Image upload service
│   │   └── utils.js          # Utility functions
│   ├── middleware/
│   │   └── protectRoute.js   # JWT authentication middleware
│   ├── models/
│   │   ├── user.model.js     # User schema
│   │   └── message.model.js  # Message schema
│   ├── routes/
│   │   ├── auth.route.js     # Auth endpoints
│   │   └── message.route.js  # Message endpoints
│   └── seeds/
│       └── user.seeds.js     # Database seed data
├── .env                      # Environment variables (local)
├── .env.example              # Example environment variables
├── .eslintrc.json            # ESLint configuration
├── package.json              # Dependencies and scripts
└── vercel.json               # Vercel deployment config
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173,http://localhost:3000` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your-api-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-secret` |
| `JWT_SECRET` | Secret for JWT token signing | `your-secret-key` |

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check` - Check auth status (protected)
- `PUT /api/auth/update-profile` - Update user profile (protected)

### Messages
- `GET /api/messages/users` - Get all users for sidebar (protected)
- `GET /api/messages/:id` - Get messages with specific user (protected)
- `POST /api/messages/send/:id` - Send message to user (protected)

## WebSocket Events

Real-time communication via Socket.io:
- `getOnlineUsers` - Broadcast list of online user IDs
- `newMessage` - Receive new message in real-time

## Troubleshooting

### Database Connection Fails
**Error:** `MongooseError: The uri parameter to openUri() must be a string, got "undefined"`

**Solution:**
- Ensure `.env` file exists in the Backend/ directory
- Verify `MONGODB_URI` is correctly set with a valid MongoDB connection string
- Check MongoDB Atlas allows your IP address

### CORS Blocking Requests
**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
- Update `CORS_ORIGINS` in `.env` to include your frontend URL
- Format: comma-separated list without spaces: `http://localhost:5173,http://localhost:3000`
- For production, include your Vercel URL: `https://your-domain.vercel.app`

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
- Change PORT in `.env` to an available port (e.g., `5001`)
- Or kill the process using port 5000

### Cloudinary Image Upload Fails
**Error:** 401 Unauthorized or invalid credentials

**Solution:**
- Verify Cloudinary API credentials are correct in `.env`
- Check your Cloudinary account status and API limits

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Automatically fix ESLint issues |

## Deployment

### Vercel
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Note:** Remove hardcoded environment variables from `vercel.json` and use Vercel's environment variable settings instead.

### Render
1. Connect GitHub repository to Render
2. Set environment variables in Render dashboard
3. Configure build command: `npm install`
4. Configure start command: `npm start`
5. Deploy

## Development Tips

- **ESLint:** Run `npm run lint:fix` before committing code
- **Nodemon:** Dev server automatically restarts on file changes
- **CORS:** Update `CORS_ORIGINS` during development for different URLs
- **Database:** Use MongoDB Atlas free tier for development
- **Cloudinary:** Use free tier for development/testing

## Common Patterns

### Adding New API Routes
1. Create controller in `src/controllers/`
2. Create route in `src/routes/`
3. Import and use in `src/index.js`

### Adding New Models
1. Create model in `src/models/`
2. Use Mongoose schema pattern (see `user.model.js` or `message.model.js`)

### Protected Routes
1. Use `protectRoute` middleware from `src/middleware/protectRoute.js`
2. Routes will automatically verify JWT from cookies

## Support

For issues or questions, refer to the main [README.md](../README.md) or contact @FujelDeveloper.

## Additional Documentation

- [Security Guide](SECURITY.md) - Security best practices and implementation
- [Testing Guide](TESTING.md) - How to write and run tests
- [Main README](../README.md) - Full project documentation
