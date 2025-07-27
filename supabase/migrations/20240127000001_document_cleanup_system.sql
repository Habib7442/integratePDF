-- Cleanup System Removal Migration
-- This removes the automated cleanup system and keeps only the useful cascade delete function

-- Remove existing cron jobs if they exist
SELECT cron.unschedule('document-cleanup-hourly') WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'document-cleanup-hourly'
);

SELECT cron.unschedule('cleanup-logs-daily') WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-logs-daily'
);

-- Drop cleanup-related functions
DROP FUNCTION IF EXISTS automated_document_cleanup();
DROP FUNCTION IF EXISTS cleanup_old_logs();

-- Drop cleanup statistics view
DROP VIEW IF EXISTS cleanup_statistics;

-- Drop cleanup logs table
DROP TABLE IF EXISTS cleanup_logs CASCADE;

-- Keep only the useful cascade delete function (without logging)
CREATE OR REPLACE FUNCTION delete_document_cascade(document_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete in order to respect foreign key constraints

    -- Delete extracted data
    DELETE FROM extracted_data WHERE document_id = delete_document_cascade.document_id;

    -- Delete integration pushes
    DELETE FROM integration_pushes WHERE document_id = delete_document_cascade.document_id;

    -- Delete processing status records
    DELETE FROM processing_status WHERE document_id = delete_document_cascade.document_id;

    -- Finally delete the document
    DELETE FROM documents WHERE id = delete_document_cascade.document_id;

EXCEPTION
    WHEN OTHERS THEN
        -- Re-raise the error for proper error handling
        RAISE;
END;
$$;

-- Grant permission to use the cascade delete function
GRANT EXECUTE ON FUNCTION delete_document_cascade(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION delete_document_cascade(UUID) TO authenticated;
