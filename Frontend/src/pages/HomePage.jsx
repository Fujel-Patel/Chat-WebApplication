import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore(); // selectedUser will be null if no user is clicked/selected

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        {/* Main chat window container */}
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">

            {/* Sidebar - Users List */}
            {/* On mobile (default): Sidebar takes full width when no user is selected.
                                  It becomes 'hidden' when a user IS selected (to show chat container fully).
              On medium screens (md:): Sidebar is always 'flex' and takes 1/3 width.
            */}
            <div className={`
              ${selectedUser ? "hidden" : "w-full"}  
              md:flex md:w-1/3 h-full
            `}>
              <Sidebar />
            </div>

            {/* Chat Container / No Chat Selected */}
            {/* On mobile (default): If no user is selected, it's 'hidden'.
                                  If a user IS selected, it takes 'w-full' (full width).
              On medium screens (md:): It's always 'flex' (or inline-flex, block etc. based on its content)
                                      and takes 2/3 width if a user is selected.
                                      If no user selected on md, it will take full width alongside sidebar.
            */}
            <div className={`
              ${!selectedUser ? "hidden md:flex" : "w-full"} 
              md:w-2/3 h-full
            `}>
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;