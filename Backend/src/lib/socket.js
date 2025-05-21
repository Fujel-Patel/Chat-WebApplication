import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express(); // Create the Express app here

const server = http.createServer(app); // Create the HTTP server with the app

// Used to store online users
const userSocketMap = {}; // { userId: socketId }

const io = new Server(server, {
  cors: {
    origin: "https://chat-web-application-eqt3-2hetdbyns-fujel-patels-projects.vercel.app/",
    credentials: true,
  },
});

// Utility to get receiver's socket ID
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }

  // Send list of online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    // Remove user from userSocketMap
    for (const [uid, sid] of Object.entries(userSocketMap)) {
      if (sid === socket.id) {
        delete userSocketMap[uid];
        break;
      }
    }

    // Notify all clients of updated online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app }; // Export io and the app

// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();
// const server = http.createServer(app);

// // Used to store online users
// const userSocketMap = {}; // { userId: socketId }

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     credentials: true,
//   },
// });

// // Utility to get receiver's socket ID
// export function getReceiverSocketId(userId) {
//   return userSocketMap[userId];
// }

// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   const userId = socket.handshake.query.userId;

//   if (userId) {
//     userSocketMap[userId] = socket.id;
//     console.log(`User ${userId} mapped to socket ${socket.id}`);
//   }

//   // Send list of online users to all clients
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("disconnect", () => {
//     console.log("A user disconnected:", socket.id);

//     // Remove user from userSocketMap
//     for (const [uid, sid] of Object.entries(userSocketMap)) {
//       if (sid === socket.id) {
//         delete userSocketMap[uid];
//         break;
//       }
//     }

//     // Notify all clients of updated online users
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// export { io, app, server };