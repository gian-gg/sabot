-- Create storage bucket for transaction screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('transaction-screenshots', 'transaction-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for transaction screenshots bucket
CREATE POLICY "Users can upload their own transaction screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'transaction-screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view screenshots from their transactions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'transaction-screenshots' AND
  (
    -- User can see their own uploads
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- User can see screenshots from transactions they're part of
    EXISTS (
      SELECT 1 FROM transaction_participants tp
      JOIN transaction_screenshots ts ON ts.transaction_id = tp.transaction_id
      WHERE tp.user_id = auth.uid()
      AND ts.file_path = name
    )
  )
);

CREATE POLICY "Users can update their own screenshots"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'transaction-screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'transaction-screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
