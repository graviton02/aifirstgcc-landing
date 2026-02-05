-- Make organization and role columns nullable for email-only signup form
ALTER TABLE early_access_signups ALTER COLUMN organization DROP NOT NULL;
ALTER TABLE early_access_signups ALTER COLUMN role DROP NOT NULL;
