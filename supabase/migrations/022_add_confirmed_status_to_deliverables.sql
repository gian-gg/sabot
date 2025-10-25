-- Add 'confirmed' as a valid status for deliverables
ALTER TABLE deliverables 
DROP CONSTRAINT IF EXISTS deliverables_status_check;

ALTER TABLE deliverables 
ADD CONSTRAINT deliverables_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'verified', 'failed', 'submitted', 'confirmed'));

