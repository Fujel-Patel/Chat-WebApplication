# Chat-WebApplication

A full-stack real-time chat application with authentication, user profiles, and image sharing, built with React (Vite), Node.js, Express, MongoDB, Socket.io, and deployed on Vercel (frontend) and Render (backend).

## Features
- Real-time messaging with Socket.io
- User authentication (signup, login, logout)
- Profile management with avatar upload (Cloudinary)
- Responsive UI with Tailwind CSS and DaisyUI
- Sidebar with online/offline status
- Image sharing in chat
- Protected routes and JWT-based auth

## Tech Stack
- **Frontend:** React 19, Vite, Zustand, Tailwind CSS, DaisyUI, Framer Motion
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, Cloudinary
- **Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas

## Folder Structure

```
├── Backend/
│   ├── package.json
│   ├── vercel.json
│   └── src/
│       ├── index.js
│       ├── keepAlive.js
│       ├── controllers/
│       ├── lib/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── seeds/
├── Frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       ├── constants/
│       ├── lib/
│       ├── pages/
│       ├── store/
│       └── assets/
├── package.json
├── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas account

### 1. Clone the repository
```sh
git clone https://github.com/Fujel-Patel/Chat-WebApplication.git
cd Chat-WebApplication
```

### 2. Setup Environment Variables

Create a `.env` file in `Backend/` with all required variables:
```bash
# Backend/.env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

For details, see [Backend/.env.example](Backend/.env.example).

### 3. Install Dependencies

```bash
# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

Alternatively, from the root directory:
```bash
# Install dependencies in both Backend and Frontend
npm install
```

### 4. Run Locally

#### Backend
```bash
cd Backend
npm run dev              # Development with hot reload (nodemon)
# or
npm run lint            # Check code quality
npm run lint:fix        # Fix linting issues
```

#### Frontend
```bash
cd Frontend
npm run dev             # Development server (Vite)
npm run build           # Build for production
npm run lint            # Check code quality
```

**Useful URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Backend Health Check: http://localhost:5000/

## Running Both Apps Together

From the repository root:
```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com)
3. Set build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy (automatic on push to main)

### Backend (Vercel/Render)

#### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Import repository in Vercel Dashboard
3. **Security:** Remove hardcoded env variables from `Backend/vercel.json`
4. Add environment variables in Vercel project settings:
   - `MONGODB_URI`, `PORT`, `NODE_ENV`, `CORS_ORIGINS`, `JWT_SECRET`, etc.
5. Set start command: `npm start`
6. Deploy

#### Option 2: Render.com
1. Push code to GitHub
2. Create new Web Service in Render
3. Connect GitHub repository
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add environment variables in Render dashboard
6. Deploy

### MongoDB & Cloudinary
- Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database
- Use [Cloudinary](https://cloudinary.com/) for image uploads
- Both have free tiers suitable for development and small projects

## Environment Variables (Reference)

### Backend Required
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 5000) |
| `CORS_ORIGINS` | Comma-separated allowed origins |

For full details, see [Backend/.env.example](Backend/.env.example) and [Backend/README.md](Backend/README.md).

## Main Scripts
- `npm run dev` - Start backend with nodemon
- `npm run start` - Start backend in production
- `npm run build` (Frontend) - Build React app

## Troubleshooting

### Backend Won't Start
1. **Check `.env` file exists:** `Backend/.env` with all required variables
2. **Check MongoDB URI:** Verify your MongoDB Atlas connection string is correct
3. **Port in use:** Change PORT in `.env` if port 5000 is already in use
4. **Dependencies missing:** Run `npm install` in Backend directory

### CORS/Frontend Can't Connect to Backend
1. **Update `CORS_ORIGINS`** in `Backend/.env`:
   ```
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```
2. **Restart backend** after updating `.env`
3. **Check frontend URL** matches exactly (including port)

### Image Upload Fails
1. **Verify Cloudinary credentials** in `Backend/.env`
2. **Check API limits** in Cloudinary dashboard
3. **Ensure free tier** is not maxed out

### Build or Runtime Errors
1. Check [Backend README](Backend/README.md) for backend-specific issues
2. Check console logs for specific error messages
3. Ensure Node.js version is v18 or higher: `node --version`

For more troubleshooting, see [Backend/README.md](Backend/README.md).

## API Endpoints (Backend)
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check auth (protected)
- `PUT /api/auth/update-profile` - Update profile (protected)
- `GET /api/messages/users` - Get users for sidebar (protected)
- `GET /api/messages/:id` - Get messages with user (protected)
- `POST /api/messages/send/:id` - Send message (protected)

## WebSocket Events
- Real-time messaging and online status via Socket.io

## Documentation

- [Backend README](Backend/README.md) - Backend setup, commands, and API reference
- [Backend Security Guide](Backend/SECURITY.md) - Security best practices and implementation
- [Backend Testing Guide](Backend/TESTING.md) - How to write and run tests
- [Frontend README](Frontend/README.md) - Frontend setup and commands

## Continuous Integration

This project uses GitHub Actions for automated testing and linting:

- **Backend Workflow** (`.github/workflows/backend.yml`)
  - Runs ESLint on all backend code
  - Runs Jest test suite
  - Uploads coverage reports to Codecov
  - Triggered on push/PR to `main` or `develop` branches

- **Frontend Workflow** (`.github/workflows/frontend.yml`)
  - Runs ESLint on all frontend code
  - Builds the frontend for production
  - Uploads build artifacts
  - Triggered on push/PR to `main` or `develop` branches

### Before Committing

Ensure code quality by running locally:
```bash
# Backend
cd Backend
npm run lint      # Check for issues
npm run lint:fix  # Fix issues automatically
npm test          # Run tests

# Frontend
cd Frontend
npm run lint      # Check for issues
npm run build     # Verify production build
```

## Author
- @FujelDeveloper