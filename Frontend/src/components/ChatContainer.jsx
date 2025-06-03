import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react"; // Import useState here!

import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { formatMessageTime } from "../lib/utils";

import { motion, AnimatePresence } from "framer-motion";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    addMessageListener,
    removeMessageListener,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);

  // --- NEW STATE FOR IMAGE MODAL ---
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  // --- END NEW STATE ---

  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      getMessages(selectedUser._id);
    }

    if (socket) {
      addMessageListener(socket);
    }

    return () => {
      if (socket) {
        removeMessageListener(socket);
      }
    };
  }, [
    selectedUser,
    getMessages,
    socket,
    addMessageListener,
    removeMessageListener,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages?.length > 0) {
      requestAnimationFrame(() => {
        messageEndRef.current.scrollTop = messageEndRef.current.scrollHeight;
      });
    }
  }, [messages]);

  // --- NEW FUNCTION TO CLOSE MODAL ---
  const handleCloseModal = () => {
    setShowImageModal(false);
    setModalImageUrl(""); // Clear the image URL when closing
  };
  // --- END NEW FUNCTION ---

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Select a user to start chatting</p>
      </div>
    );
  }

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <ChatHeader selectedUser={selectedUser} />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <MessageSkeleton />
        </div>
        <MessageInput selectedUser={selectedUser} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader selectedUser={selectedUser} />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        ref={messageEndRef}
      >
        {messages && messages.length > 0 ? (
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const isOwn = message.senderId === authUser?._id;

              const senderProfile = isOwn ? authUser : selectedUser;
              const messageProfilePic = senderProfile?.profilePic || "/avatar.png";

              const messageInitials =
                senderProfile?.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) ||
                senderProfile?.username?.charAt(0).toUpperCase() ||
                "?";

              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`chat ${isOwn ? "chat-end" : "chat-start"}`}
                >
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full border">
                      {messageProfilePic && messageProfilePic !== "/avatar.png" ? (
                        <img
                          src={messageProfilePic}
                          alt={senderProfile?.fullName || "User"}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="size-10 bg-base-300 flex items-center justify-center rounded-full text-sm font-semibold">
                          {messageInitials}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="chat-header mb-1">
                    <time className="text-xs opacity-50 ml-1">
                      {formatMessageTime(message.createdAt)}
                    </time>
                  </div>

                  <div className="chat-bubble flex flex-col">
                    {message.image && (
                      // --- MODIFIED: Added onClick to open modal ---
                      <div
                        className="relative cursor-pointer" // Makes it look clickable
                        onClick={() => {
                          setModalImageUrl(message.image);
                          setShowImageModal(true);
                        }}
                      >
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="max-w-full sm:max-w-[200px] rounded-md mb-2"
                        />
                      </div>
                      // --- END MODIFIED ---
                    )}
                    {message.text && <p>{message.text}</p>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-gray-600">
              Say hello to start the conversation!
            </p>
          </div>
        )}
      </div>

      <MessageInput selectedUser={selectedUser} />

      {/* --- NEW MODAL COMPONENT --- */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal} // Close modal when clicking on the dimmed background
        >
          <div
            className="relative max-w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking on the image itself
          >
            <img
              src={modalImageUrl}
              alt="Full screen image"
              className="max-w-full max-h-full object-contain" // object-contain to ensure image fits within bounds
            />
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white text-3xl bg-gray-900 bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-100 transition-opacity"
            >
              &times; {/* This is an 'X' character for close */}
            </button>
          </div>
        </div>
      )}
      {/* --- END NEW MODAL COMPONENT --- */}
    </div>
  );
};

export default ChatContainer;