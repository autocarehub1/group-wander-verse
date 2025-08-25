import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Paperclip, FileImage, File, Files } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface GroupChatProps {
  tripId: string;
  tripTitle: string;
}

export const GroupChat = ({ tripId, tripTitle }: GroupChatProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading, uploading, sendMessage, uploadFile, editMessage, deleteMessage } = useChat(tripId);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    // Determine message type based on file type
    const messageType = file.type.startsWith('image/') ? 'image' : 'document';
    
    await uploadFile(file, messageType);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim()) return;
    
    await editMessage(messageId, editContent);
    setEditingMessage(null);
    setEditContent('');
  };

  const startEdit = (message: ChatMessage) => {
    setEditingMessage(message.id);
    setEditContent(message.content);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isOwn = message.sender_id === user?.id;
    const showDate = index === 0 || 
      new Date(message.created_at).toDateString() !== 
      new Date(messages[index - 1]?.created_at).toDateString();

    return (
      <div key={message.id}>
        {showDate && (
          <div className="flex justify-center my-4">
            <Badge variant="outline" className="text-xs">
              {formatDate(message.created_at)}
            </Badge>
          </div>
        )}
        
        <div className={`flex gap-2 mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          {!isOwn && (
            <Avatar className="h-8 w-8 mt-1">
              <AvatarImage src={message.sender?.avatar_url} />
              <AvatarFallback>
                {message.sender?.full_name?.[0] || message.sender?.email[0] || '?'}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={`max-w-[70%] ${isOwn ? 'order-first' : ''}`}>
            {!isOwn && (
              <div className="text-xs text-muted-foreground mb-1">
                {message.sender?.full_name || message.sender?.email}
              </div>
            )}
            
            <div className={`rounded-lg p-3 ${
              isOwn 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              {editingMessage === message.id ? (
                <div className="space-y-2">
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEditMessage(message.id);
                      } else if (e.key === 'Escape') {
                        setEditingMessage(null);
                        setEditContent('');
                      }
                    }}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleEditMessage(message.id)}
                    >
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setEditingMessage(null);
                        setEditContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {message.message_type === 'text' && (
                    <p className="text-sm break-words">{message.content}</p>
                  )}
                  
                  {message.message_type === 'image' && (
                    <div className="space-y-2">
                      <img 
                        src={message.file_url} 
                        alt={message.file_name}
                        className="rounded max-w-full h-auto max-h-64 object-cover cursor-pointer"
                        onClick={() => window.open(message.file_url, '_blank')}
                      />
                      <p className="text-xs opacity-80">{message.file_name}</p>
                    </div>
                  )}
                  
                  {message.message_type === 'document' && (
                    <div className="flex items-center gap-2 p-2 bg-background/10 rounded">
                      <File className="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{message.file_name}</p>
                        <p className="text-xs opacity-80">
                          {message.file_size && formatFileSize(message.file_size)}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(message.file_url, '_blank')}
                      >
                        Download
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {formatTime(message.created_at)}
                      {message.edited_at && (
                        <span className="ml-1">(edited)</span>
                      )}
                    </span>
                    
                    {isOwn && message.message_type === 'text' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                          onClick={() => startEdit(message)}
                        >
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                          onClick={() => deleteMessage(message.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {tripTitle} - Group Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={uploading}
                className="flex-1"
              />
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.zip"
              />
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    disabled={uploading}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share a file</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = 'image/*';
                          fileInputRef.current.click();
                        }
                      }}
                    >
                      <FileImage className="h-6 w-6" />
                      <span>Photo</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = '.pdf,.doc,.docx,.txt,.zip';
                          fileInputRef.current.click();
                        }
                      }}
                    >
                      <Files className="h-6 w-6" />
                      <span>Document</span>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <Button type="submit" disabled={!newMessage.trim() || uploading}>
              {uploading ? 'Uploading...' : 'Send'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};