
/*
  # RuralConnect - Full Schema Migration

  ## Overview
  Complete database schema for RuralConnect, a digital marketplace for rural makers.

  ## Tables Created

  1. **profiles** - Extends auth.users with role and suspension status
     - id (uuid, FK to auth.users)
     - email, full_name
     - role: BUYER | SELLER | ADMIN
     - is_suspended: boolean

  2. **categories** - Product categories
     - id, name, description
     - Seeded with 6 default categories

  3. **products** - Marketplace listings
     - seller_id (FK profiles), category_id (FK categories)
     - title, description, price, image_url
     - status: PENDING | APPROVED | REJECTED (admin moderated)

  4. **enquiries** - Buyer-Seller communication
     - buyer_id, seller_id, product_id
     - message, status: PENDING | ACCEPTED | COMPLETED | REJECTED

  5. **reviews** - Post-completion feedback
     - buyer_id, seller_id, product_id, enquiry_id (unique)
     - rating (1-5), comment

  ## Security
  - RLS enabled on all tables
  - Role-based access control policies
  - Buyers, sellers, and admins each have scoped access
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('BUYER', 'SELLER', 'ADMIN');
CREATE TYPE product_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE enquiry_status AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'BUYER',
  is_suspended boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id),
  title text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  image_url text,
  status product_status NOT NULL DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES profiles(id),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  message text NOT NULL,
  status enquiry_status NOT NULL DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES profiles(id),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  enquiry_id uuid NOT NULL UNIQUE REFERENCES enquiries(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Seed default categories
INSERT INTO categories (name, description) VALUES
  ('Handicrafts', 'Hand-made crafts and artisanal products'),
  ('Agriculture', 'Farm produce and agricultural products'),
  ('Textiles', 'Handwoven and traditional textiles'),
  ('Food & Spices', 'Traditional foods, spices, and preserves'),
  ('Pottery', 'Clay and ceramic products'),
  ('Jewelry', 'Traditional and handcrafted jewelry')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- =====================
-- Profiles Policies
-- =====================
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'))
  WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));

-- =====================
-- Categories Policies
-- =====================
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- =====================
-- Products Policies
-- =====================
CREATE POLICY "Anyone can view approved products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (
    status = 'APPROVED'
    OR seller_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Sellers can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SELLER' AND is_suspended = false)
  );

CREATE POLICY "Sellers and admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = seller_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  )
  WITH CHECK (
    auth.uid() = seller_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Sellers and admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    auth.uid() = seller_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- =====================
-- Enquiries Policies
-- =====================
CREATE POLICY "Buyers and sellers can view own enquiries"
  ON enquiries FOR SELECT
  TO authenticated
  USING (
    buyer_id = auth.uid() OR
    seller_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Buyers can create enquiries"
  ON enquiries FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'BUYER' AND is_suspended = false)
  );

CREATE POLICY "Sellers and buyers can update enquiry status"
  ON enquiries FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid() OR buyer_id = auth.uid())
  WITH CHECK (seller_id = auth.uid() OR buyer_id = auth.uid());

-- =====================
-- Reviews Policies
-- =====================
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Buyers can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'BUYER')
  );
