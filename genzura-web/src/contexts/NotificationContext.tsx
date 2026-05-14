import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const newSocket = io(baseUrl);
      
      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join', user.id);
      });

      newSocket.on('case_status_updated', (data) => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: 'Case Status Updated',
          message: `Case ${data.title} is now ${data.status}`,
          time: 'Just now',
          read: false,
          type: 'info'
        };
        setNotifications(prev => [newNotification, ...prev]);
        toast(newNotification.message, { icon: 'ℹ️' });
      });

      newSocket.on('new_case_note', () => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: 'New Case Note',
          message: `A new note was added to your case.`,
          time: 'Just now',
          read: false,
          type: 'success'
        };
        setNotifications(prev => [newNotification, ...prev]);
        toast.success(newNotification.message);
      });

      setSocket(newSocket);
      console.log('Socket initialized:', socket?.id);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
