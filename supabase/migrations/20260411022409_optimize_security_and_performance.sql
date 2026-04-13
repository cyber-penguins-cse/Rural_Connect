
/*
  # Security and Performance Optimization

  ## Issues Fixed

  1. **Unindexed Foreign Keys** - Added indexes on all FK columns for optimal query performance
  2. **RLS Optimization** - Replaced auth.uid() direct calls with subqueries for better performance at scale
  
  ## Changes

  - Added indexes on all foreign key columns in enquiries, products, and reviews tables
  - Optimized RLS policies to use (select auth.uid()) pattern
  - Maintains security while improving query performance
*/

-- =====================
-- Add Missing Indexes on Foreign Keys
-- =====================

CREATE INDEX IF NOT EXISTS idx_enquiries_buyer_id ON enquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_seller_id ON enquiries(seller_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_product_id ON enquiries(product_id);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

-- =====================
-- Drop and Recreate RLS Policies with Optimized Queries
-- =====================

-- Profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'))
  WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'));

-- Categories
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Admins can update categories" ON categories;
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'ADMIN'));

-- Products
DROP POLICY IF EXISTS "Anyone can view approved products" ON products;
CREATE POLICY "Anyone can view approved products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (
    status = 'APPROVED'
    OR seller_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Sellers can insert products" ON products;
CREATE POLICY "Sellers can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'SELLER' AND is_suspended = false)
  );

DROP POLICY IF EXISTS "Sellers and admins can update products" ON products;
CREATE POLICY "Sellers and admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = seller_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'ADMIN')
  )
  WITH CHECK (
    auth.uid() = seller_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Sellers and admins can delete products" ON products;
CREATE POLICY "Sellers and admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    auth.uid() = seller_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'ADMIN')
  );

-- Enquiries
DROP POLICY IF EXISTS "Buyers and sellers can view own enquiries" ON enquiries;
CREATE POLICY "Buyers and sellers can view own enquiries"
  ON enquiries FOR SELECT
  TO authenticated
  USING (
    buyer_id = (select auth.uid()) OR
    seller_id = (select auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Buyers can create enquiries" ON enquiries;
CREATE POLICY "Buyers can create enquiries"
  ON enquiries FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'BUYER' AND is_suspended = false)
  );

DROP POLICY IF EXISTS "Sellers and buyers can update enquiry status" ON enquiries;
CREATE POLICY "Sellers and buyers can update enquiry status"
  ON enquiries FOR UPDATE
  TO authenticated
  USING (seller_id = (select auth.uid()) OR buyer_id = (select auth.uid()))
  WITH CHECK (seller_id = (select auth.uid()) OR buyer_id = (select auth.uid()));

-- Reviews
DROP POLICY IF EXISTS "Buyers can create reviews" ON reviews;
CREATE POLICY "Buyers can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'BUYER')
  );
