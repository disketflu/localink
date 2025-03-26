import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface BaseTour {
  title: string;
  imageUrl: string;
}

interface TouristBooking {
  id: string;
  status: string;
  tour: BaseTour & {
    guide: {
      name: string;
    };
  };
}

interface GuideBooking {
  id: string;
  status: string;
  tourist: {
    name: string;
    email: string;
  };
  tour: BaseTour;
}

type Booking = TouristBooking | GuideBooking;

export default function Messages({ bookings }: { bookings: Booking[] }) {
  const { data: session } = useSession();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const isGuide = session?.user?.role === 'GUIDE';
  const t = useTranslations('messages');
  
  // Filter only active bookings
  const activeBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED" || booking.status === "PENDING"
  );

  const getParticipantName = (booking: Booking) => {
    if (isGuide) {
      return (booking as GuideBooking).tourist.name;
    }
    return (booking as TouristBooking).tour.guide.name;
  };

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
          <p className="text-sm text-gray-500">
            {t(`subtitle.${isGuide ? 'guide' : 'tourist'}`)}
          </p>
        </div>
        
        {activeBookings.map((booking) => (
          <button
            key={booking.id}
            onClick={() => setSelectedChat(booking.id)}
            className={`w-full p-4 text-left hover:bg-gray-50 ${
              selectedChat === booking.id ? 'bg-gray-50' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {booking.tour.imageUrl ? (
                  <Image
                    src={booking.tour.imageUrl}
                    alt={booking.tour.title}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <ChatBubbleLeftIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {booking.tour.title}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {t(`participant.${isGuide ? 'tourist' : 'guide'}`)}: {getParticipantName(booking)}
                </p>
              </div>
            </div>
          </button>
        ))}
        {activeBookings.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            {t('noActiveBookings')}
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatWindow 
            bookingId={selectedChat} 
            userId={session?.user?.id || ''}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            {t('selectChat')}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatWindow({ 
  bookingId, 
  userId
}: { 
  bookingId: string;
  userId: string;
}) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('messages');

  // Fetch messages
  const fetchMessages = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setIsInitialLoading(true);
      }
      const response = await fetch(`/api/messages/${bookingId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages);
      setError(null);
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (isInitialLoad) {
        setError(t('error'));
      }
    } finally {
      if (isInitialLoad) {
        setIsInitialLoading(false);
      }
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    fetchMessages(true); // Initial load
    
    // Set up polling every 1 second
    const interval = setInterval(() => fetchMessages(false), 1000);
    
    // Cleanup on unmount or when bookingId changes
    return () => clearInterval(interval);
  }, [bookingId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          bookingId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();
      setMessages((prev) => [...prev, newMessage]);
      setMessage('');
      setError(null);
    } catch (err) {
      setError(t('sendError'));
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2">{t('loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === userId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-sm ${
                msg.senderId === userId
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>{msg.content}</p>
              <div className="flex items-center mt-1 space-x-2">
                <p className="text-xs opacity-75">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
                {msg.sender && (
                  <p className="text-xs opacity-75">
                    {msg.sender.name || t('anonymous')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('input.placeholder')}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {t('input.send')}
          </button>
        </div>
      </form>
    </>
  );
} 