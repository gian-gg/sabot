-- Update agreement status constraints to new flow
-- Remove old statuses: 'both_joined', 'questionnaire_completed', 'active'
-- Add new status: 'in-progress'
-- Keep existing: 'waiting_for_participant', 'finalized', 'cancelled'

-- First, update any existing records with old statuses to new statuses
UPDATE agreements 
SET status = 'in-progress' 
WHERE status IN ('both_joined', 'questionnaire_completed', 'active');

-- Drop the old constraint
ALTER TABLE agreements DROP CONSTRAINT IF EXISTS agreements_status_check;

-- Add the new constraint with updated status values
ALTER TABLE agreements ADD CONSTRAINT agreements_status_check 
CHECK (status IN ('waiting_for_participant', 'in-progress', 'finalized', 'cancelled'));

-- Update the function name to be more generic since we're using 'in-progress' now
DROP FUNCTION IF EXISTS check_both_joined(UUID);

CREATE OR REPLACE FUNCTION check_agreement_ready_for_progress(agreement_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  participant_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO participant_count
  FROM agreement_participants
  WHERE agreement_id = agreement_uuid;

  RETURN participant_count = 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the new status flow
COMMENT ON COLUMN agreements.status IS 
'Agreement status flow: waiting_for_participant -> in-progress -> finalized. cancelled can only be applied to in-progress agreements.';