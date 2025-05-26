// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

function App() {
  const { authUser, isCheckingAuth, checkAuth, connectSocket, disconnectSocket, socket } = useAuthStore(); // Get socket and its actions from auth store

  // Check authentication on app mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Initialize/Disconnect socket based on authUser existence
  useEffect(() => {
    if (authUser) {
      // If authUser exists, initialize socket connection
      // Only connect if socket is null or disconnected
      if (!socket || !socket.connected) {
         connectSocket();
      }
    } else {
      // If no authUser, disconnect socket (e.g., after logout)
      if (socket && socket.connected) {
        disconnectSocket();
      }
    }

    // Cleanup on component unmount (or authUser change to null)
    return () => {
      // Make sure to clean up the socket when the app unmounts
      if (socket && socket.connected) {
         disconnectSocket();
      }
    };
  }, [authUser, connectSocket, disconnectSocket, socket]); // Add socket to dependency array

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <LoginPage />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <HomePage />} />
          <Route path="/signup" element={!authUser ? <SignupPage /> : <HomePage />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <LoginPage />} />
          {/* Other routes */}
        </Routes>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

// import { useEffect } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import { Loader } from "lucide-react";

// import Navbar from "./components/Navbar";
// import HomePage from "./pages/HomePage";
// import SignupPage from "./pages/SignupPage";
// import LoginPage from "./pages/LoginPage";
// import SettingsPage from "./pages/SettingsPage";
// import ProfilePage from "./pages/ProfilePage";
// import { useAuthStore } from "./store/useAuthStore";
// import { useThemeStore } from "./store/useThemeStore";

// const App = () => {
//   const { authUser, isCheckingAuth, connectSocket } = useAuthStore();
//   const { theme } = useThemeStore();
//   const checkAuth = useAuthStore((state) => state.checkAuth);

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     if (authUser && authUser._id) {
//       connectSocket();
//     }
//   }, [authUser, connectSocket]);

//   if (isCheckingAuth && !authUser) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader className="w-10 h-10 animate-spin" />
//       </div>
//     );
//   }

//   console.log("authUser:", authUser);
//   console.log("isCheckingAuth:", isCheckingAuth);

//   return (
//     <div data-theme={theme}>
//       <Navbar />
//       <Routes>
//         <Route
//           path="/"
//           element={authUser ? <HomePage /> : <Navigate to="/login" />}
//         />
//         <Route
//           path="/signup"
//           element={!authUser ? <SignupPage /> : <Navigate to="/" />}
//         />
//         <Route
//           path="/login"
//           element={!authUser ? <LoginPage /> : <Navigate to="/" />}
//         />
//         <Route
//           path="/settings"
//           element={authUser ? <SettingsPage /> : <Navigate to="/login" />}
//         />
//         <Route
//           path="/profile"
//           element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
//         />
//       </Routes>
//       <Toaster />
//     </div>
//   );
// };

// export default App;
