import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser, // Ensure selectedUser is correctly pulled from the store
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Effect to fetch messages and subscribe to socket events for the selected user
  useEffect(() => {
    // CRITICAL FIX: Only call getMessages and subscribe if a user is actually selected
    if (selectedUser && selectedUser._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    // Cleanup function for socket subscription
    return () => {
      // Only unsubscribe if a user was selected, to prevent errors on unmount
      if (selectedUser && selectedUser._id) {
         unsubscribeFromMessages();
      }
    };
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]); // Dependency on selectedUser object

  // Effect to scroll to the latest message
  useEffect(() => {
    // Only scroll if messages exist and the ref is attached
    if (messageEndRef.current && messages && messages.length > 0) {
      // Find the last message element and scroll to it
      const lastMessageElement = messageEndRef.current.parentElement.lastElementChild;
      if (lastMessageElement) {
        lastMessageElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]); // Trigger scroll when messages change

  // --- Initial Render / Loading States ---

  // Show loading skeleton if messages are loading
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader /> {/* Still show header even when loading */}
        <MessageSkeleton />
        {/* MessageInput can be shown or hidden based on preference */}
        <MessageInput />
      </div>
    );
  }

  // CRITICAL FIX: Show a fallback message if no user is selected
  // This prevents errors if selectedUser is undefined/null
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Select a user to start chatting</p>
      </div>
    );
  }

  // --- Main Chat Display ---
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Pass selectedUser to ChatHeader if it needs user info */}
      <ChatHeader selectedUser={selectedUser} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messageEndRef}>
        {/* CRITICAL FIX: Only map messages if the array exists and has items */}
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser?._id ? "chat-end" : "chat-start"}`}
              // The ref should ideally be on the last message for auto-scrolling
              // However, you had it on every message. I've adjusted the scroll effect.
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      // Use optional chaining for authUser and selectedUser, though `|| "/avatar.png"` handles most
                      (message.senderId === authUser?._id
                        ? authUser?.profilePic
                        : selectedUser?.profilePic) || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {/* Defensive call to formatMessageTime */}
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {/* Defensive check for message.text */}
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

      {/* Pass selectedUser to MessageInput if it needs the recipient's ID */}
      <MessageInput selectedUser={selectedUser} />
    </div>
  );
};

export default ChatContainer;