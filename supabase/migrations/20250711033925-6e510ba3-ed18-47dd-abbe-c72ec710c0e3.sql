-- Allow anyone to view invitation details with a valid token (for accepting invitations)
CREATE POLICY "Anyone can view invitations with valid token" 
ON public.trip_invitations 
FOR SELECT 
USING (
  invitation_token IS NOT NULL 
  AND status = 'pending' 
  AND expires_at > now()
);