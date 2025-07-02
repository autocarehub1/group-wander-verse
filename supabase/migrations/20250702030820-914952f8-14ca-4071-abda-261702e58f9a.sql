-- Check and remove problematic foreign key constraints
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'users' AND constraint_name LIKE '%fkey%';

-- Remove any self-referencing or problematic foreign key constraints on users table
DO $$ 
DECLARE
    constraint_rec record;
BEGIN
    FOR constraint_rec IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'users' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%users%'
    LOOP
        EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS ' || constraint_rec.constraint_name;
    END LOOP;
END $$;

-- Ensure the users table has proper structure without circular dependencies
-- The auth.users table should be the source of truth for user IDs
-- Our public.users table should reference auth.users, not itself