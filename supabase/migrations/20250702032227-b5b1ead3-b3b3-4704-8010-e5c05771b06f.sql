-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Trip participants can view invitations" ON public.trip_invitations;
DROP POLICY IF EXISTS "Trip organizers can create invitations" ON public.trip_invitations;
DROP POLICY IF EXISTS "Trip organizers can update invitations" ON public.trip_invitations;
DROP POLICY IF EXISTS "Anyone can accept invitations with valid token" ON public.trip_invitations;
DROP POLICY IF EXISTS "Trip participants can read messages" ON public.messages;
DROP POLICY IF EXISTS "Trip participants can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

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
  invite_value TEXT,
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

-- Update trip_participants with more status options
ALTER TABLE public.trip_participants 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'declined', 'removed')),
ADD COLUMN IF NOT EXISTS invitation_id UUID REFERENCES public.trip_invitations(id);

-- Update role constraint to include co-organizer
ALTER TABLE public.trip_participants 
DROP CONSTRAINT IF EXISTS trip_participants_role_check;

ALTER TABLE public.trip_participants 
ADD CONSTRAINT trip_participants_role_check 
CHECK (role IN ('owner', 'co-organizer', 'participant'));

-- Enable RLS on new tables
ALTER TABLE public.trip_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;