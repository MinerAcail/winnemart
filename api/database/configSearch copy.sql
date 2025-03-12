-- 1. First, let's install the pg_trgm extension for trigram matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Modify the search vector function to include more fields and improve indexing
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.categories, ' '), '')), 'B') ||
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- 3. Create a trigram index on the name column for fuzzy matching
DROP INDEX IF EXISTS products_name_trgm_idx;
CREATE INDEX products_name_trgm_idx ON products USING GIN (name gin_trgm_ops);

-- 4. Update existing records with improved search vectors
UPDATE products SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(categories, ' '), '')), 'B') ||