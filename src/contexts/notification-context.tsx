
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string; // ISO string
  link?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  recipientId: string; // To ensure notifications are for the correct user
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (recipientId: string) => void;
  clearNotifications: (recipientId: string) => void;
  getNotificationsForUser: (recipientId: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = 'appNotifications';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // To filter notifications

  // Load notifications from localStorage on initial mount
  useEffect(() => {
    try {
      const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error("Failed to load notifications from localStorage:", error);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error("Failed to save notifications to localStorage:", error);
    }
  }, [notifications]);

  // This would typically come from AuthContext
  useEffect(() => {
    // Simulate getting current user ID. In a real app, integrate with AuthContext.
    // For now, let's assume there's a way to get it.
    // If you have AuthContext, you can listen to user changes here.
    // const { user } = useAuth(); // Example
    // setCurrentUserId(user?.uid || null);
  }, []);


  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prevNotifications => [newNotification, ...prevNotifications].slice(0, 50)); // Keep last 50
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);
  
  const getNotificationsForUser = useCallback((recipientId: string): Notification[] => {
    return notifications
      .filter(n => n.recipientId === recipientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications]);

  const unreadCount = useCallback((recipientId: string): number => {
    return getNotificationsForUser(recipientId).filter(n => !n.read).length;
  }, [getNotificationsForUser]);


  const markAllAsRead = useCallback((recipientId: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n => (n.recipientId === recipientId ? { ...n, read: true } : n))
    );
  }, []);

  const clearNotifications = useCallback((recipientId: string) => {
    setNotifications(prevNotifications => prevNotifications.filter(n => n.recipientId !== recipientId));
  }, []);

  return (
    <NotificationContext.Provider value={{ 
        notifications, 
        // This needs to be dynamic based on logged-in user
        get unreadCount() { return currentUserId ? unreadCount(currentUserId) : 0; },
        addNotification, 
        markAsRead, 
        markAllAsRead: (userId) => markAllAsRead(userId), 
        clearNotifications: (userId) => clearNotifications(userId),
        getNotificationsForUser
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
