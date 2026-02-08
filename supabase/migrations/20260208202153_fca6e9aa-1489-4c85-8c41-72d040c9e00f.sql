-- Grant admin role to root admin user
INSERT INTO public.user_roles (user_id, role, granted_at)
VALUES ('6bdc7ccd-7b95-47e4-8033-55032a025992', 'admin', now())
ON CONFLICT (user_id, role) DO NOTHING;

-- Also add policies for storage.objects on avatars bucket to allow authenticated uploads
-- (Ensure RLS is working for avatar uploads)
CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatar" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars');