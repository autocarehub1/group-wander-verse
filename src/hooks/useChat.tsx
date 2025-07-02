import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users(id, full_name, email, avatar_url)
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as ChatMessage[]);
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
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          trip_id: tripId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType
        }])
        .select()
        .single();

      if (error) throw error;
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
    if (!user || !tripId) return null;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${tripId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const bucket = messageType === 'image' ? 'chat-images' : 'chat-documents';

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Create message with file
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert([{
          trip_id: tripId,
          sender_id: user.id,
          content: file.name,
          message_type: messageType,
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      toast({
        title: "File uploaded successfully",
        description: `${messageType === 'image' ? 'Image' : 'Document'} shared with the group.`
      });

      return message;
    } catch (error: any) {
      toast({
        title: "Error uploading file",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: newContent,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user?.id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user?.id);

      if (error) throw error;

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

  // Set up real-time subscription
  useEffect(() => {
    if (!tripId) return;

    fetchMessages();

    // Create realtime channel for new messages
    channelRef.current = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `trip_id=eq.${tripId}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Fetch the complete message with sender info
          const { data: newMessage } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users(id, full_name, email, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (newMessage) {
            setMessages(prev => [...prev, newMessage as ChatMessage]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `trip_id=eq.${tripId}`
        },
        async (payload) => {
          console.log('Message updated:', payload);
          
          // Fetch the updated message with sender info
          const { data: updatedMessage } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users(id, full_name, email, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (updatedMessage) {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === payload.new.id ? updatedMessage as ChatMessage : msg
              )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `trip_id=eq.${tripId}`
        },
        (payload) => {
          console.log('Message deleted:', payload);
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
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