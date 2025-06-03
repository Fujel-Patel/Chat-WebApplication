import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOBILE_BREAKPOINT = 768;

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useChatStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [mobileView, setMobileView] = useState('sidebar'); // 'sidebar' or 'chat'

  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(currentIsMobile);

      if (!currentIsMobile) {
        setMobileView('both');
      } else {
        if (selectedUser) {
          setMobileView('chat');
        } else {
          setMobileView('sidebar');
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedUser]);

  useEffect(() => {
    if (isMobile) {
      if (selectedUser) {
        setMobileView('chat');
      } else {
        setMobileView('sidebar');
      }
    } else {
      setMobileView('both');
    }
  }, [selectedUser, isMobile]);


  const handleBackToSidebar = () => {
    setSelectedUser(null);
  };

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden relative">
            <AnimatePresence>
              {(!isMobile || mobileView === 'sidebar') && (
                <motion.div
                  key="sidebar-panel"
                  initial={{ x: isMobile ? "-100%" : 0 }}
                  animate={{ x: 0 }}
                  exit={{ x: isMobile ? "-100%" : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${
                    isMobile ? "absolute top-0 left-0 bottom-0 z-20 w-full" : "w-72"
                  } bg-base-100 border-r border-base-300 flex-shrink-0`}
                >
                  <Sidebar />
                </motion.div>
              )}

              {(!isMobile || mobileView === 'chat') && (
                <motion.div
                  key="chat-panel"
                  initial={{ x: isMobile ? "100%" : 0 }}
                  animate={{ x: 0 }}
                  exit={{ x: isMobile ? "100%" : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${
                    isMobile ? "absolute top-0 left-0 bottom-0 right-0 z-30 flex flex-col" : "flex-1 flex flex-col"
                  } bg-base-100`}
                >
                  {selectedUser ? (
                    <>
                      {isMobile && (
                        <button
                          onClick={handleBackToSidebar}
                          className="p-3 border-b border-base-300 text-left hover:bg-base-300"
                          aria-label="Back to contacts"
                        >
                          &larr; Back to contacts
                        </button>
                      )}
                      <ChatContainer />
                    </>
                  ) : (
                    !isMobile && <NoChatSelected />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;