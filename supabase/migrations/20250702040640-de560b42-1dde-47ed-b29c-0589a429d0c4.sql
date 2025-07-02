-- Create storage buckets for chat files
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('chat-images', 'chat-images', true),
  ('chat-documents', 'chat-documents', false);

-- Storage policies for chat images (public)
CREATE POLICY "Anyone can view chat images" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-images');

CREATE POLICY "Trip participants can upload chat images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-images' AND
    EXISTS (
      SELECT 1 FROM public.trip_participants 
      WHERE trip_id = (split_part(name, '/', 1))::uuid 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Storage policies for chat documents (private)
CREATE POLICY "Trip participants can view chat documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-documents' AND
    EXISTS (
      SELECT 1 FROM public.trip_participants 
      WHERE trip_id = (split_part(name, '/', 1))::uuid 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Trip participants can upload chat documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-documents' AND
    EXISTS (
      SELECT 1 FROM public.trip_participants 
      WHERE trip_id = (split_part(name, '/', 1))::uuid 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Enable realtime for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;