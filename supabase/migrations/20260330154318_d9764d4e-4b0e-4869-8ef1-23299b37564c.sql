
-- Add cover_image column to posts
ALTER TABLE public.posts ADD COLUMN cover_image text;

-- Create post-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true);

-- Allow admins to upload to post-images
CREATE POLICY "Admins can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-images' AND public.is_admin(auth.uid())
);

-- Allow admins to update post images
CREATE POLICY "Admins can update post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-images' AND public.is_admin(auth.uid())
);

-- Allow admins to delete post images
CREATE POLICY "Admins can delete post images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-images' AND public.is_admin(auth.uid())
);

-- Allow anyone to view post images (public bucket)
CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');
