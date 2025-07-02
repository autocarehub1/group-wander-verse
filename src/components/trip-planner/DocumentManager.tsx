import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Download, ExternalLink, Trash2 } from 'lucide-react';

interface TripDocument {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string | null;
  file_size?: number | null;
  description?: string | null;
  document_type?: string | null;
  is_private?: boolean | null;
  uploaded_by?: string | null;
  trip_id: string;
  created_at?: string | null;
  updated_at?: string | null;
}

interface DocumentManagerProps {
  tripId: string;
}

export const DocumentManager = ({ tripId }: DocumentManagerProps) => {
  const [documents, setDocuments] = useState<TripDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newDocument, setNewDocument] = useState({
    description: '',
    document_type: 'general',
    is_private: false
  });
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trip_documents')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading documents",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${tripId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('trip-documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('trip_documents')
        .insert([{
          trip_id: tripId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          description: newDocument.description || undefined,
          document_type: newDocument.document_type,
          is_private: newDocument.is_private
        }]);

      if (dbError) throw dbError;

      setNewDocument({
        description: '',
        document_type: 'general',
        is_private: false
      });
      setIsAddOpen(false);
      await fetchDocuments();
      
      toast({
        title: "Document uploaded successfully",
        description: "Your document has been added to the trip."
      });
    } catch (error: any) {
      toast({
        title: "Error uploading document",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('trip_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      await fetchDocuments();
      
      toast({
        title: "Document deleted",
        description: "Document has been removed from the trip."
      });
    } catch (error: any) {
      toast({
        title: "Error deleting document",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchDocuments();
  }, [tripId]);

  if (loading) {
    return <div className="text-center py-8">Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Trip Documents</h3>
          <p className="text-sm text-muted-foreground">Share tickets, confirmations, and other important files</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>Add a new document to share with the group.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadDocument(file);
                  }}
                  disabled={uploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document-description">Description (Optional)</Label>
                <Input
                  id="document-description"
                  placeholder="Brief description of the document"
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document-type">Type</Label>
                <select
                  id="document-type"
                  className="w-full h-10 px-3 border rounded-md"
                  value={newDocument.document_type}
                  onChange={(e) => setNewDocument({ ...newDocument, document_type: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="ticket">Ticket</option>
                  <option value="confirmation">Confirmation</option>
                  <option value="itinerary">Itinerary</option>
                  <option value="passport">Passport/ID</option>
                  <option value="insurance">Insurance</option>
                  <option value="map">Map</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents uploaded yet.</p>
            <p className="text-sm text-muted-foreground">Upload important trip documents to share with the group!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground mt-1" />
                    <div>
                      <h4 className="font-medium">{document.file_name}</h4>
                      {document.description && (
                        <p className="text-sm text-muted-foreground">{document.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{document.document_type}</Badge>
                        {document.file_size && (
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(document.file_size)}
                          </span>
                        )}
                        {document.is_private && (
                          <Badge variant="secondary">Private</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(document.file_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument(document.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};