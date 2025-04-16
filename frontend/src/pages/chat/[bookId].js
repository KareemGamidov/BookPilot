import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';
import { chatAPI, booksAPI } from '../../utils/api';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { bookId } = router.query;
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (bookId) {
      fetchBookAndMessages();
    }
  }, [isAuthenticated, bookId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchBookAndMessages = async () => {
    try {
      setLoading(true);
      const [bookResponse, messagesResponse] = await Promise.all([
        booksAPI.getBook(bookId),
        chatAPI.getMessages(bookId)
      ]);
      
      setBook(bookResponse.data);
      setMessages(messagesResponse.data);
      setError('');
    } catch (err) {
      console.error('Error fetching chat data:', err);
      setError('Failed to load chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSendingMessage(true);
      
      // Add user message to UI immediately for better UX
      const userMessage = {
        role: 'user',
        content: newMessage,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      
      // Send message to API
      const response = await chatAPI.sendMessage(bookId, {
        role: 'user',
        content: newMessage
      });
      
      // Add AI response to messages
      setMessages(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-secondary-500">Loading chat...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
        <Button variant="outline" onClick={() => router.push('/books')}>
          Back to Books
        </Button>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-secondary-700 mb-2">Book not found</h3>
          <p className="text-secondary-500 mb-6">
            The book you're looking for doesn't exist.
          </p>
          <Button variant="outline" onClick={() => router.push('/books')}>
            Back to Books
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Chat with Book</h1>
          <p className="text-secondary-600">{book.title}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/guides/${bookId}`)}
        >
          Back to Guide
        </Button>
      </div>
      
      <Card className="h-[calc(100vh-240px)] flex flex-col">
        <div className="flex-grow overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="bg-primary-50 p-6 rounded-full mb-4">
                <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-secondary-700 mb-2">Start a conversation</h3>
              <p className="text-secondary-500 max-w-md">
                Ask questions about the book, request clarification on concepts, or explore related topics.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user' 
                        ? 'bg-primary-100 text-primary-900' 
                        : 'bg-secondary-100 text-secondary-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' 
                        ? 'text-primary-500' 
                        : 'text-secondary-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="border-t border-secondary-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="mb-0 flex-grow"
              disabled={sendingMessage}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!newMessage.trim() || sendingMessage}
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </div>
      </Card>
    </Layout>
  );
};

export default Chat;
