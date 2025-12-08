-- Create lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  embed_link TEXT,
  pdf_urls TEXT[], -- Array of PDF URLs
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT video_or_embed CHECK (
    (video_url IS NOT NULL AND embed_link IS NULL) OR
    (video_url IS NULL AND embed_link IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view lessons
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  USING (true);

-- Policy: Only admins can insert
CREATE POLICY "Admins can insert lessons"
  ON lessons FOR INSERT
  WITH CHECK (
    created_by IN ('ahmetyadgarovjust@gmail.com', 'axmadjonyodgorov@gmail.com')
  );

-- Policy: Only admins can update their own lessons
CREATE POLICY "Admins can update lessons"
  ON lessons FOR UPDATE
  USING (
    created_by IN ('ahmetyadgarovjust@gmail.com', 'axmadjonyodgorov@gmail.com')
  );

-- Policy: Only admins can delete
CREATE POLICY "Admins can delete lessons"
  ON lessons FOR DELETE
  USING (
    created_by IN ('ahmetyadgarovjust@gmail.com', 'axmadjonyodgorov@gmail.com')
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-videos', 'lesson-videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-pdfs', 'lesson-pdfs', true);

-- Storage policies for videos
CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-videos');

CREATE POLICY "Admins can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lesson-videos' AND
    auth.email() IN ('ahmetyadgarovjust@gmail.com', 'axmadjonyodgorov@gmail.com')
  );

-- Storage policies for PDFs
CREATE POLICY "Anyone can view PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-pdfs');

CREATE POLICY "Admins can upload PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lesson-pdfs' AND
    auth.email() IN ('ahmetyadgarovjust@gmail.com', 'axmadjonyodgorov@gmail.com')
  );
