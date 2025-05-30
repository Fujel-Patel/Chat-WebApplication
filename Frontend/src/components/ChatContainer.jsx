import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

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
  }, [selectedUser, getMessages, socket, addMessageListener, removeMessageListener]);

  useEffect(() => {
    if (messageEndRef.current && messages?.length > 0) {
      messageEndRef.current.scrollTop = messageEndRef.current.scrollHeight;
    }
  }, [messages]);

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
              const profilePic =
                (isOwn ? authUser?.profilePic : selectedUser?.profilePic) ||
                "/avatar.png";

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
                      <img
                        src={profilePic}
                        alt="profile pic"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>

                  <div className="chat-header mb-1">
                    <time className="text-xs opacity-50 ml-1">
                      {formatMessageTime(message.createdAt)}
                    </time>
                  </div>

                  <div className="chat-bubble flex flex-col">
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="max-w-full sm:max-w-[200px] rounded-md mb-2"
                      />
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
    </div>
  );
};

export default ChatContainer;