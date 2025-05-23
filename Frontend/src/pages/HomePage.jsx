function HomePage() {
  const { 
    selectedUser, 
    getUsers, 
    subscribeToMessages, 
    unsubscribeFromMessages, 
    setSelectedUser 
  } = useChatStore();
  const { authUser } = useAuthStore();

  // Load users once on mount
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Subscribe/unsubscribe to messages on selectedUser change
  useEffect(() => {
    if (selectedUser) {
      subscribeToMessages();
    } else {
      unsubscribeFromMessages();
    }

    // Cleanup on unmount
    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser, subscribeToMessages, unsubscribeFromMessages]);

  // Optional: clear selected user on logout
  useEffect(() => {
    if (!authUser) {
      setSelectedUser(null);
    }
  }, [authUser, setSelectedUser]);

  return (
    <main className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </main>
  );
}

export default HomePage;