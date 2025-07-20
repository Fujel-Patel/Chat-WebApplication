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

Create a `.env` file in `Backend/` with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Install Dependencies
```sh
# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### 4. Run Locally
#### Backend
```sh
cd Backend
npm run dev
```
#### Frontend
```sh
cd Frontend
npm run dev
```
Frontend: http://localhost:5173  
Backend: http://localhost:5000

## Deployment
- **Frontend:** Deploy `Frontend/` to Vercel
- **Backend:** Deploy `Backend/` to Render.com
- **MongoDB:** Use MongoDB Atlas

## Environment Variables (Backend)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret for JWT tokens
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - For image uploads

## Main Scripts
- `npm run dev` - Start backend with nodemon
- `npm run start` - Start backend in production
- `npm run build` (Frontend) - Build React app

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

## Author
- @FujelDeveloper