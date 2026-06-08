/*
  # Update handle_new_user for email/password auth

  1. Modified Functions
    - `handle_new_user()` - Updated to read `full_name` from `raw_user_meta_data`
      which is where Supabase stores the `data` object passed during `signUp()`
    - Removed Google OAuth-specific fields (avatar_url, picture)

  2. Important Notes
    - Email/password auth stores user metadata in `raw_user_meta_data`
    - The `full_name` field is populated from the signup form
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;