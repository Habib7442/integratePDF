-- Row Level Security (RLS) Policies for Clerk-Supabase Integration
-- Run this in your Supabase SQL editor to set up proper security

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;
DROP POLICY IF EXISTS "Users can view own extracted data" ON extracted_data;
DROP POLICY IF EXISTS "Users can insert own extracted data" ON extracted_data;
DROP POLICY IF EXISTS "Users can update own extracted data" ON extracted_data;
DROP POLICY IF EXISTS "Users can delete own extracted data" ON extracted_data;
DROP POLICY IF EXISTS "Users can view own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can insert own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can update own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can delete own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can view own templates" ON document_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON document_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON document_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON document_templates;

-- Helper function to get current user's database ID from Clerk JWT
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  -- Extract the clerk_user_id from the JWT token
  RETURN (
    SELECT id 
    FROM users 
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

-- Documents table policies
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (user_id = get_current_user_id());

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (user_id = get_current_user_id());

-- Extracted data table policies
CREATE POLICY "Users can view own extracted data" ON extracted_data
  FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "Users can insert own extracted data" ON extracted_data
  FOR INSERT WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update own extracted data" ON extracted_data
  FOR UPDATE USING (user_id = get_current_user_id());

CREATE POLICY "Users can delete own extracted data" ON extracted_data
  FOR DELETE USING (user_id = get_current_user_id());

-- Integrations table policies
CREATE POLICY "Users can view own integrations" ON integrations
  FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "Users can insert own integrations" ON integrations
  FOR INSERT WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update own integrations" ON integrations
  FOR UPDATE USING (user_id = get_current_user_id());

CREATE POLICY "Users can delete own integrations" ON integrations
  FOR DELETE USING (user_id = get_current_user_id());

-- Document templates table policies
CREATE POLICY "Users can view own templates" ON document_templates
  FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "Users can insert own templates" ON document_templates
  FOR INSERT WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update own templates" ON document_templates
  FOR UPDATE USING (user_id = get_current_user_id());

CREATE POLICY "Users can delete own templates" ON document_templates
  FOR DELETE USING (user_id = get_current_user_id());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_extracted_data_user_id ON extracted_data(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_user_id ON document_templates(user_id);
