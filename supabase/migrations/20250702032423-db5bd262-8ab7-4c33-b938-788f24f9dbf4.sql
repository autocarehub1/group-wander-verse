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
  
  SELECT * INTO invitation_record 
  FROM public.trip_invitations 
  WHERE invitation_token = accept_trip_invitation.invitation_token
  AND status = 'pending'
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = invitation_record.trip_id 
    AND user_id = accept_trip_invitation.user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'User already a participant');
  END IF;
  
  INSERT INTO public.trip_participants (trip_id, user_id, role, status, invitation_id)
  VALUES (invitation_record.trip_id, user_id, 'participant', 'active', invitation_record.id);
  
  UPDATE public.trip_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE id = invitation_record.id;
  
  RETURN json_build_object('success', true, 'trip_id', invitation_record.trip_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;