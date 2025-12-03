-- Add KYC document fields to vendor_applications table
ALTER TABLE vendor_applications
ADD COLUMN IF NOT EXISTS business_license_url TEXT,
ADD COLUMN IF NOT EXISTS ntn_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS id_proof_url TEXT,
ADD COLUMN IF NOT EXISTS bank_statement_url TEXT,
ADD COLUMN IF NOT EXISTS other_documents JSONB DEFAULT '[]'::jsonb;

-- Create storage bucket for vendor KYC documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-documents', 'vendor-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for vendor-documents bucket
CREATE POLICY "Vendors can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vendor-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Vendors can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'vendor-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all vendor documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'vendor-documents' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Vendors can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vendor-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Vendors can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vendor-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);