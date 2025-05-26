import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = ({ selectedUser }) => { // <--- selectedUser prop add kiya hai, ye zaroori hai!
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, isSendingMessage } = useChatStore(); // <--- isSendingMessage bhi pull kiya hai

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return; // No file selected

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      e.target.value = ''; // Clear file input
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // Add file size limit (2MB example)
        toast.error("Image size should be less than 2MB");
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.onerror = () => toast.error("Failed to read file"); // Handle reader error
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    // Disable send if no text/image or if already sending
    if ((!text.trim() && !imagePreview) || isSendingMessage) return;

    if (!selectedUser?._id) { // Defensive check: ensure a user is selected
        toast.error("Please select a user to send a message.");
        return;
    }

    try {
      await sendMessage({ // Assuming sendMessage needs recipient ID
        receiverId: selectedUser._id, // Pass receiverId
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form on successful send
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message."); // Show user feedback on error
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center text-gray-400 hover:bg-base-200" // Added color for X button
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSendingMessage} // Disable input while sending
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={isSendingMessage} // Disable file input while sending
          />

          {/* FIX: Removed 'hidden sm:flex' to make it visible on all screen sizes */}
          <button
            type="button"
            className={`flex btn btn-circle text-gray-500 hover:text-gray-700 transition-colors
                        ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`} // Added hover states
            onClick={() => fileInputRef.current?.click()}
            disabled={isSendingMessage} // Disable button while sending
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle btn-primary" // Added btn-primary for styling
          disabled={!text.trim() && !imagePreview || isSendingMessage} // Disable send button appropriately
        >
          {isSendingMessage ? ( // Show loading spinner if sending
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <Send size={22} />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;