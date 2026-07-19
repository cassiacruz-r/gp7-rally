
CREATE POLICY "auth read avatars" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "auth write avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "auth update avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "auth delete avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');

CREATE POLICY "auth read biblio" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'biblioteca');
CREATE POLICY "auth write biblio" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'biblioteca');
CREATE POLICY "auth update biblio" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'biblioteca');
CREATE POLICY "auth delete biblio" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'biblioteca');
