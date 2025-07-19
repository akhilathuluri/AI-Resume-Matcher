-- Update embedding column to support 3072 dimensions for text-embedding-3-large
-- This migration safely updates the existing embedding column to handle larger dimensions

-- Step 1: Create a new temporary column with 3072 dimensions
ALTER TABLE resumes ADD COLUMN embedding_new vector(3072);

-- Step 2: Copy existing 1536-dimensional embeddings to the new column (they will be null for now)
-- We can't directly convert 1536 to 3072 dimensions, so we'll set them to null
-- These will need to be regenerated using the "Upgrade AI" button in the app
UPDATE resumes SET embedding_new = NULL WHERE embedding IS NOT NULL;

-- Step 3: Drop the old embedding column
ALTER TABLE resumes DROP COLUMN embedding;

-- Step 4: Rename the new column to the original name
ALTER TABLE resumes RENAME COLUMN embedding_new TO embedding;

-- Step 5: Add a comment to document the change
COMMENT ON COLUMN resumes.embedding IS 'AI embedding vector using text-embedding-3-large model (3072 dimensions)';

-- Step 6: Skip index creation due to pgvector dimension limitations
-- Both ivfflat and hnsw indexes have a 2000 dimension limit in current pgvector version
-- Similarity search will still work but may be slower for very large datasets
-- The app will use brute-force vector similarity which is fine for typical resume databases

-- Alternative: You could create an index on a subset of dimensions if needed
-- Or wait for future pgvector updates that support higher dimensions

-- For now, similarity search will work without index optimization
