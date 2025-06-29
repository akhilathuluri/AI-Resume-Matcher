/*
  # Add Storage Policies for Resume Uploads

  1. Storage Policies
    - Enable RLS on storage.objects table for 'resumes' bucket
    - Add policy for authenticated users to insert files in their own folder
    - Add policy for authenticated users to select their own files
    - Add policy for authenticated users to delete their own files

  2. Security
    - Files are organized by user_id folders (e.g., user_id/filename.pdf)
    - Users can only access files in their own folder
    - Authenticated users only
*/

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload files to their own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resumes' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy to allow authenticated users to view their own files
CREATE POLICY "Users can view their own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy to allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resumes' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create the resumes bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;