import { useEffect, useState, useRef } from "react";
import api from "../../utils/apiClient";
import { format } from "date-fns";

interface Conversation {
  id: number;
  participants: { id: number; first_name: string }[];
  last_message: { message: string } | null;
  timestamp: string;
}

interface Message {
  id: number;
  sender: { id: number; first_name: string };
  receiver: { id: number; first_name: string };
  message: string;
  timestamp: string;
}

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<"conversations" | "messages">("conversations");
  const [product, setProduct] = useState(null); // New state for the product

  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for chat container

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  let userId = 0;
  if (typeof window !== "undefined") {
    userId = parseInt(localStorage.getItem("userId") || "0", 10);
  }

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth <= 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You need to be logged in to view your conversations.");
        return;
      }
      setLoading(true);
      try {
        const response = await api.get("/users/messages/conversations/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        setError("Failed to load conversations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Fetch Messages
  const fetchMessages = async (conversationId: number) => {
    try {
        const response = await api.get(`/users/messages/conversation/${conversationId}/`);
        setMessages(response.data.messages);
        setProduct(response.data.product); // Set product state from API
        setError(null);
    } catch (err) {
        console.error("Failed to fetch messages:", err);
        setError("Failed to load messages. Please try again later.");
    }
};


  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation.id);
    fetchMessages(conversation.id);
    const otherParticipant = conversation.participants.find((p) => p.id !== userId);
    setSelectedUser(otherParticipant ? otherParticipant.id : null);
    if (isMobile) setMobileView("messages");
    try {
      await api.post(`/users/messages/conversation/${conversation.id}/read/`);
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage || !selectedConversation) {
      setError("Please type a message.");
      return;
    }
    try {
      const response = await api.post("/users/messages/", {
        conversation: selectedConversation,
        message: newMessage,
        receiver: selectedUser,
      });
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
      setError(null);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  // Mobile view
  if (isMobile) {
    return (
      <div className="container mx-auto py-12">
        {mobileView === "conversations" && (
          <>
            <h1 className="text-4xl font-bold text-center mb-8">Conversations</h1>
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleConversationSelect(conversation)}
              >
                <p>
                  {conversation.participants
                    .filter((p) => p.id !== userId)
                    .map((p) => p.first_name)
                    .join(", ")}{" "}
                  - {conversation.last_message?.message?.slice(0, 20) || "No messages yet"}...
                </p>
                <span className="text-sm text-gray-500">
                  {conversation.timestamp
                    ? new Date(conversation.timestamp).toLocaleTimeString()
                    : "Invalid date"}
                </span>
              </div>
            ))}
          </>
        )}
        {mobileView === "messages" && (
  <>
    <button
      onClick={() => setMobileView("conversations")}
      className="mb-4 text-blue-500"
    >
      Back to Conversations
    </button>
    <h1 className="text-4xl font-bold text-center mb-8">Messages</h1>

    {/* Pinned Product Section */}
    {product && (
      <div className="p-4 border-b mb-4 flex items-center gap-4">
        <img
          src={product.image || "/placeholder.png"}
          alt={product.title}
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <h2 className="text-lg font-bold">
            <a
              href={`/products/${product.id}`} // Link to product details page
              className="text-blue-600 hover:underline"
            >
              {product.title}
            </a>
          </h2>
          <p className="text-sm text-gray-600">{product.category}</p>
          <p className="text-blue-600 font-bold">
            ${parseFloat(product.price).toFixed(2)}
          </p>
        </div>
      </div>
    )}

    <div
      ref={chatContainerRef} // Attach ref to chat container
      className="border p-4 h-64 overflow-y-scroll bg-gray-100"
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`mb-2 flex ${
            msg.sender.id === userId ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`p-3 rounded-lg max-w-xs ${
              msg.sender.id === userId
                ? "bg-green-200 text-right"
                : "bg-blue-200 text-left"
            }`}
          >
            <p>{msg.message}</p>
            <span className="text-xs text-gray-500 block mt-1">
              {msg.timestamp
                ? format(new Date(msg.timestamp), "PPpp")
                : "Invalid Date"}
            </span>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-4 flex items-center gap-4">
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="flex-1 border rounded px-4 py-2"
        placeholder="Type your message and press Send"
      />
      <button
        onClick={handleSendMessage}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  </>
)}

      </div>
    );
  }

  // Desktop view
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Messages</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 border-r">
          <h2 className="text-lg font-semibold mb-4">Conversations</h2>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="py-2 px-4 border-b cursor-pointer"
              onClick={() => handleConversationSelect(conversation)}
            >
              <p>
                {conversation.participants
                  .filter((p) => p.id !== userId)
                  .map((p) => p.first_name)
                  .join(", ")}{" "}
                - {conversation.last_message?.message?.slice(0, 20) || "No messages yet"}...
              </p>
            </div>
          ))}
        </div>
        <div className="col-span-2">
  {selectedConversation ? (
    <>
      {/* Pinned Product Section */}
      {product && (
        <div className="p-4 border-b mb-4 flex items-center gap-4">
          <img
            src={product.image || "/placeholder.png"}
            alt={product.title}
            className="w-16 h-16 object-cover rounded"
          />
          <div>
            <h2 className="text-lg font-bold">
              <a
                href={`/products/${product.id}`} // Link to product details page
                className="text-blue-600 hover:underline"
              >
                {product.title}
              </a>
            </h2>
            <p className="text-sm text-gray-600">{product.category}</p>
            <p className="text-blue-600 font-bold">
              ${parseFloat(product.price).toFixed(2)}
            </p>
          </div>
        </div>
      )}


      <h2 className="text-lg font-semibold mb-4">Chat</h2>
      <div
        ref={chatContainerRef} // Attach ref to chat container
        className="border p-4 h-64 overflow-y-scroll bg-gray-100"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 flex ${
              msg.sender.id === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs ${
                msg.sender.id === userId
                  ? "bg-green-200 text-right"
                  : "bg-blue-200 text-left"
              }`}
            >
              <p>{msg.message}</p>
              <span className="text-xs text-gray-500 block mt-1">
                {msg.timestamp
                  ? format(new Date(msg.timestamp), "PPpp")
                  : "Invalid Date"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded px-4 py-2"
          placeholder="Type your message and press Send"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </>
  ) : (
    <p>Select a conversation to start chatting</p>
  )}
</div>

      </div>
    </div>
  );
};

export default Messages;
