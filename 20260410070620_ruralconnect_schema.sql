/*
  # Fix Product Detail View - Allow Anonymous Profile Access

  ## Problem
  Product detail page shows "Product not found" because anonymous users cannot view seller profiles due to RLS policies.

  ## Solution
  Add RLS policy to allow anonymous users to view seller profile information needed for product display.

  ## Changes
  - Add policy allowing anonymous users to SELECT from profiles table
  - This enables unauthenticated visitors to see seller names and contact info on product detail pages
*/

CREATE POLICY "Anonymous users can view seller profiles"
  ON profiles
  FOR SELECT
  TO anon
  USING (true);
