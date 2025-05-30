import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    addMessageListener, // NEW: pull addMessageListener
    removeMessageListener, // NEW: pull removeMessageListener
  } = useChatStore();

  const { authUser, socket } = useAuthStore(); // Get authUser and socket from useAuthStore
  const messageEndRef = useRef(null);

  // Effect to fetch messages and manage socket listeners for the selected user
  useEffect(() => {
    // 1. Fetch messages for the selected user
    if (selectedUser && selectedUser._id) {
      getMessages(selectedUser._id);
    }

    // 2. Set up/clean up socket listeners for new messages
    // This effect runs whenever `socket` or `selectedUser` changes.
    // `addMessageListener` will internally handle `socket.off("newMessage")`
    // before adding a new one, preventing duplicates.
    if (socket) { // Only set up listener if socket is available
      addMessageListener(socket);
    }

    // Cleanup function for socket listener
    return () => {
      // Remove the global 'newMessage' listener when component unmounts or dependencies change
      if (socket) {
        removeMessageListener(socket);
      }
    };
  }, [selectedUser, getMessages, socket, addMessageListener, removeMessageListener]); // Dependencies

  // Effect to scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current && messages && messages.length > 0) {
      messageEndRef.current.scrollTop = messageEndRef.current.scrollHeight;
    }
  }, [messages]);

  // --- Initial Render / Loading States ---
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

  // --- Main Chat Display ---
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader selectedUser={selectedUser} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messageEndRef}>
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${
                message.senderId === authUser?._id ? "chat-end" : "chat-start"
              }`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      (message.senderId === authUser?._id
                        ? authUser?.profilePic
                        : selectedUser?.profilePic) || "User" || "/avatar.png"
                    }
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
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-gray-600">Say hello to start the conversation!</p>
          </div>
        )}
      </div>

      <MessageInput selectedUser={selectedUser} />
    </div>
  );
};

export default ChatContainer;