import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useChatStore();

  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Detect mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowSidebar(true); // always show sidebar on desktop
      } else {
        setShowSidebar(true); // initially show sidebar on mobile
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // When a user is selected on mobile, hide sidebar and show chat
  useEffect(() => {
    if (isMobile) {
      if (selectedUser) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    }
  }, [selectedUser, isMobile]);

  // Back button handler on mobile chat view
  const handleBackToSidebar = () => {
    setSelectedUser(null);
    setShowSidebar(true);
  };

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden relative">
            {/* Sidebar with animation */}
            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  key="sidebar"
                  initial={{ x: isMobile ? 0 : 0, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: isMobile ? "-100%" : 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${
                    isMobile ? "absolute top-0 left-0 bottom-0 z-20 w-full max-w-xs" : "w-72"
                  } bg-base-100 border-r border-base-300 flex-shrink-0`}
                >
                  <Sidebar />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat container with animation */}
            <AnimatePresence>
              {!showSidebar && selectedUser && (
                <motion.div
                  key="chat"
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-0 left-0 bottom-0 right-0 z-30 bg-base-100 flex flex-col"
                >
                  {/* Back button on mobile */}
                  {isMobile && (
                    <button
                      onClick={handleBackToSidebar}
                      className="p-3 border-b border-base-300 text-left hover:bg-base-300"
                      aria-label="Back to contacts"
                    >
                      ← Back to contacts
                    </button>
                  )}
                  <ChatContainer />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop view: show chat container side-by-side */}
            {!isMobile && (
              <div className="flex-1 flex flex-col">
                {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;