-- Add DELETE policy for trip organizers to manage invitations
CREATE POLICY "Trip organizers can delete invitations" 
ON public.trip_invitations 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM trip_participants 
    WHERE trip_participants.trip_id = trip_invitations.trip_id 
    AND trip_participants.user_id = auth.uid() 
    AND trip_participants.role IN ('owner', 'co-organizer')
  )
);

-- Create function to cleanup declined invitations automatically
CREATE OR REPLACE FUNCTION public.cleanup_declined_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete invitations that have been declined for more than 24 hours
  DELETE FROM public.trip_invitations 
  WHERE status = 'declined' 
  AND updated_at < (now() - INTERVAL '1 day');
  
  -- Also clean up expired pending invitations
  DELETE FROM public.trip_invitations 
  WHERE status = 'pending' 
  AND expires_at < now();
END;
$$;

-- Create function to auto-cleanup on status change
CREATE OR REPLACE FUNCTION public.trigger_invitation_cleanup()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If invitation was just declined, schedule cleanup after 24 hours
  IF NEW.status = 'declined' AND OLD.status != 'declined' THEN
    -- In a real scenario, you might want to use pg_cron or background jobs
    -- For now, we'll just clean up immediately for declined invitations older than 1 day
    DELETE FROM public.trip_invitations 
    WHERE status = 'declined' 
    AND updated_at < (now() - INTERVAL '1 day')
    AND id != NEW.id; -- Don't delete the current one immediately
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic cleanup when status changes
CREATE TRIGGER trigger_auto_cleanup_invitations
  AFTER UPDATE ON public.trip_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_invitation_cleanup();

-- Set up a cron job to run cleanup daily (requires pg_cron extension)
-- First enable the extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily cleanup at 2 AM
SELECT cron.schedule(
  'cleanup-declined-invitations',
  '0 2 * * *', -- Daily at 2 AM
  $$
  SELECT public.cleanup_declined_invitations();
  $$
);