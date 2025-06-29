/*
  # Fix Storage RLS Policies for Resume Uploads

  1. Storage Bucket
    - Create `resumes` bucket if it doesn't exist
    - Set bucket to private (not public)

  2. Storage Policies
    - Allow authenticated users to upload files to their own folder
    - Allow users to view their own files
    - Allow users to delete their own files
    - Folder structure: user_id/filename

  3. Security
    - All policies check that the folder name matches the authenticated user's ID
    - Only authenticated users can access the storage
*/

-- Create the resumes bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes', 
  'resumes', 
  false, 
  524288000, -- 500MB in bytes
  ARRAY['application/pdf', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['application/pdf', 'text/plain'];

-- Policy to allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload files to their own folder" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy to allow authenticated users to view their own files
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy to allow authenticated users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy to allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);