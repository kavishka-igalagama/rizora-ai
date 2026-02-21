"use client";

import ChatList from "@/components/dashboard/common/chat/ChatList";
import ChatContent from "@/components/dashboard/common/chat/ChatContent";

const Messages = () => {
  return (
    <div className="h-full min-h-0 bg-background overflow-hidden">
      {/* Main Content */}
      <main className="mx-auto px-4 py-6 h-full min-h-0 flex flex-col overflow-hidden">
        <div className="mx-auto h-full min-h-0 flex flex-col w-full overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
            {/* Contacts List */}
            <ChatList />

            {/* Chat Area */}
            <ChatContent />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
