import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ChatMessage {
  id: string;
  trip_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'document' | 'system';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  reply_to_message_id?: string;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
}

export const useChat = (tripId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  const fetchMessages = async () => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/trips/${tripId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'system' = 'text') => {
    if (!user || !tripId || !content.trim()) return null;

    try {
      const response = await fetch(`/api/trips/${tripId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      await fetchMessages(); // Refresh messages
      return data;
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const uploadFile = async (file: File, messageType: 'image' | 'document') => {
    // File upload functionality temporarily disabled
    toast({
      title: "File upload not available",
      description: "File upload functionality is temporarily disabled during migration.",
      variant: "destructive"
    });
    return null;
  };

  const editMessage = async (messageId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newContent,
          edited_at: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit message');
      }

      await fetchMessages(); // Refresh messages
      toast({
        title: "Message edited",
        description: "Your message has been updated."
      });
    } catch (error: any) {
      toast({
        title: "Error editing message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      await fetchMessages(); // Refresh messages
      toast({
        title: "Message deleted",
        description: "Your message has been removed."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Fetch messages when tripId changes
  useEffect(() => {
    if (!tripId) return;
    fetchMessages();
  }, [tripId]);

  return {
    messages,
    loading,
    uploading,
    sendMessage,
    uploadFile,
    editMessage,
    deleteMessage,
    refetchMessages: fetchMessages
  };
};