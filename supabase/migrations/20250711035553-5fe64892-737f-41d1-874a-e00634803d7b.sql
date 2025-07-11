-- Fix foreign key constraint issue by ensuring user exists before inserting into trip_participants
CREATE OR REPLACE FUNCTION public.accept_trip_invitation(invitation_token uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  invitation_record public.trip_invitations;
  current_user_id UUID;
  user_exists BOOLEAN;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Check if user exists in users table
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = current_user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN json_build_object('success', false, 'error', 'User profile not found. Please complete your profile setup first.');
  END IF;
  
  SELECT * INTO invitation_record 
  FROM public.trip_invitations 
  WHERE trip_invitations.invitation_token = accept_trip_invitation.invitation_token
  AND status = 'pending'
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = invitation_record.trip_id 
    AND trip_participants.user_id = current_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'User already a participant');
  END IF;
  
  INSERT INTO public.trip_participants (trip_id, user_id, role, status, invitation_id)
  VALUES (invitation_record.trip_id, current_user_id, 'participant', 'active', invitation_record.id);
  
  UPDATE public.trip_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE id = invitation_record.id;
  
  RETURN json_build_object('success', true, 'trip_id', invitation_record.trip_id);
END;
$function$