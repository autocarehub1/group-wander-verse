-- Extend trips table for better group management
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS group_settings JSONB DEFAULT '{
  "allow_member_invites": false,
  "auto_approve_members": true,
  "chat_enabled": true
}'::jsonb;

-- Create trip invitations table for invite system
CREATE TABLE IF NOT EXISTS public.trip_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invite_type TEXT NOT NULL CHECK (invite_type IN ('email', 'phone', 'link')),
  invite_value TEXT, -- email address, phone number, or null for link invites
  invitation_token UUID DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages table for group chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  reply_to_message_id UUID REFERENCES public.messages(id),
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update trip_participants with more role options and status
ALTER TABLE public.trip_participants 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'declined', 'removed')),
ADD COLUMN IF NOT EXISTS invitation_id UUID REFERENCES public.trip_invitations(id);

-- Update role enum to include co-organizer
ALTER TABLE public.trip_participants 
DROP CONSTRAINT IF EXISTS trip_participants_role_check;

ALTER TABLE public.trip_participants 
ADD CONSTRAINT trip_participants_role_check 
CHECK (role IN ('owner', 'co-organizer', 'participant'));

-- Enable RLS on new tables
ALTER TABLE public.trip_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trip_invitations
CREATE POLICY "Trip participants can view invitations" ON public.trip_invitations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = trip_invitations.trip_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Trip organizers can create invitations" ON public.trip_invitations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = trip_invitations.trip_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'co-organizer')
  )
);

CREATE POLICY "Trip organizers can update invitations" ON public.trip_invitations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = trip_invitations.trip_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'co-organizer')
  )
);

-- Public policy for accepting invitations via token
CREATE POLICY "Anyone can accept invitations with valid token" ON public.trip_invitations
FOR UPDATE USING (
  status = 'pending' 
  AND expires_at > now()
  AND invitation_token IS NOT NULL
);

-- RLS Policies for messages
CREATE POLICY "Trip participants can read messages" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = messages.trip_id 
    AND user_id = auth.uid()
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can send messages" ON public.messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = messages.trip_id 
    AND user_id = auth.uid()
    AND status = 'active'
  )
  AND sender_id = auth.uid()
);

CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON public.messages
FOR DELETE USING (sender_id = auth.uid());

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trip_invitations_updated_at
  BEFORE UPDATE ON public.trip_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to accept trip invitation
CREATE OR REPLACE FUNCTION public.accept_trip_invitation(invitation_token UUID)
RETURNS JSON AS $$
DECLARE
  invitation_record public.trip_invitations;
  user_id UUID;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Get invitation details
  SELECT * INTO invitation_record 
  FROM public.trip_invitations 
  WHERE invitation_token = accept_trip_invitation.invitation_token
  AND status = 'pending'
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Check if user is already a participant
  IF EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = invitation_record.trip_id 
    AND user_id = accept_trip_invitation.user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'User already a participant');
  END IF;
  
  -- Add user as participant
  INSERT INTO public.trip_participants (trip_id, user_id, role, status, invitation_id)
  VALUES (invitation_record.trip_id, user_id, 'participant', 'active', invitation_record.id);
  
  -- Update invitation status
  UPDATE public.trip_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE id = invitation_record.id;
  
  RETURN json_build_object('success', true, 'trip_id', invitation_record.trip_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;